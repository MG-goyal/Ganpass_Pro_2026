from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_db, get_current_user, get_current_admin
from app.schemas.user import UserRegister, UserLogin, AdminLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(data: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Public devotee registration. Strictly assigns role='user'.
    """
    email_clean = data.email.lower().strip()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Block registering with the reserved admin email
    if email_clean == settings.ADMIN_INITIAL_EMAIL.lower().strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "RESERVED_EMAIL", "message": "This email address is reserved."}
        )

    if db is not None:
        existing = await db.users.find_one({"email": email_clean})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "EMAIL_EXISTS", "message": "An account with this email already exists."}
            )

    user_id = f"user-{uuid.uuid4().hex[:10]}"
    password = data.password or "devotee123"
    hashed = get_password_hash(password)

    new_user = {
        "id": user_id,
        "name": data.name.strip(),
        "email": email_clean,
        "whatsapp": data.whatsapp or "",
        "role": "user",  # Locked to standard user only
        "password_hash": hashed,
        "stamps": [],
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    if db is not None:
        await db.users.insert_one(new_user)

    token = create_access_token(
        subject=user_id,
        role="user",
        extra_claims={"name": new_user["name"], "email": new_user["email"]}
    )

    user_resp = UserResponse(
        id=user_id,
        name=new_user["name"],
        email=new_user["email"],
        whatsapp=new_user["whatsapp"],
        role="user",
        stamps=[],
        created_at=now_iso,
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login_user(data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Public devotee login. Requires valid credentials for existing users.
    """
    email_clean = data.email.lower().strip()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    user = await db.users.find_one({"email": email_clean})

    if not user or not verify_password(data.password or "devotee123", user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
        )

    token = create_access_token(
        subject=user["id"],
        role=user.get("role", "user"),
        extra_claims={"name": user["name"], "email": user["email"]}
    )

    stamps = []
    if db is not None:
        cursor = db.stamps.find({"user_id": user["id"]})
        async for s in cursor:
            stamps.append(s["mandal_id"])

    user_resp = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        whatsapp=user.get("whatsapp", ""),
        role=user.get("role", "user"),
        stamps=stamps,
        created_at=user.get("created_at"),
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.post("/admin/login", response_model=TokenResponse)
async def login_admin(data: AdminLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Secure Mandal Admin Portal Login. Strictly checks admin role and password.
    """
    email_clean = data.email.lower().strip()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    admin_user = await db.users.find_one({"email": email_clean, "role": {"$in": ["admin", "superadmin"]}})

    if not admin_user:
        # Check initial default admin seeding fallback
        if email_clean == settings.ADMIN_INITIAL_EMAIL.lower().strip() and data.password == settings.ADMIN_INITIAL_PASSWORD:
            now_iso = datetime.now(timezone.utc).isoformat()
            admin_user = {
                "id": "admin-super",
                "name": settings.ADMIN_INITIAL_NAME,
                "email": email_clean,
                "whatsapp": "+91 98200 99999",
                "role": "admin",
                "password_hash": get_password_hash(data.password),
                "created_at": now_iso,
                "updated_at": now_iso,
            }
            await db.users.insert_one(admin_user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_ADMIN_CREDENTIALS", "message": "Invalid admin email or password."}
            )
    else:
        if not verify_password(data.password, admin_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_ADMIN_CREDENTIALS", "message": "Invalid admin email or password."}
            )

    token = create_access_token(
        subject=admin_user["id"],
        role="admin",
        extra_claims={"name": admin_user["name"], "email": admin_user["email"]}
    )

    user_resp = UserResponse(
        id=admin_user["id"],
        name=admin_user["name"],
        email=admin_user["email"],
        whatsapp=admin_user.get("whatsapp", ""),
        role="admin",
        stamps=[],
        created_at=admin_user.get("created_at"),
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Get profile and live collected stamps for currently authenticated user.
    """
    stamps = []
    if db is not None:
        cursor = db.stamps.find({"user_id": current_user["id"]})
        async for s in cursor:
            stamps.append(s["mandal_id"])

    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        whatsapp=current_user.get("whatsapp", ""),
        role=current_user.get("role", "user"),
        stamps=stamps,
        created_at=current_user.get("created_at"),
    )

@router.get("/admin/me", response_model=UserResponse)
async def get_admin_me(current_admin: dict = Depends(get_current_admin)):
    """
    Verifies admin session credentials.
    """
    return UserResponse(
        id=current_admin["id"],
        name=current_admin["name"],
        email=current_admin["email"],
        whatsapp=current_admin.get("whatsapp", ""),
        role="admin",
        stamps=[],
        created_at=current_admin.get("created_at"),
    )