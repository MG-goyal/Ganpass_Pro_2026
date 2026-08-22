from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.core.security import decode_token
from app.schemas.user import UserResponse

security_bearer = HTTPBearer(auto_error=False)

async def get_db() -> AsyncIOMotorDatabase:
    db = get_database()
    return db

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NOT_AUTHENTICATED", "message": "Authentication required. Please provide a valid Bearer token."},
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Session expired or invalid token."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    if db is not None:
        user = await db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}]}, {"_id": 0, "password_hash": 0})
        if user:
            return user

    # In-memory / mock payload fallback if DB is pending
    return {
        "id": user_id,
        "name": payload.get("name", "User"),
        "email": payload.get("email", user_id if "@" in user_id else "user@ganpass.in"),
        "role": payload.get("role", "user"),
        "stamps": []
    }

async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Access restricted to authorized Mandal Admin Officers."}
        )
    return current_user

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Optional[dict]:
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if not payload or "sub" not in payload:
            return None
        user_id = payload["sub"]
        if db is not None:
            user = await db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}]}, {"_id": 0, "password_hash": 0})
            if user:
                return user
        return {
            "id": user_id,
            "name": payload.get("name", "User"),
            "email": payload.get("email", user_id),
            "role": payload.get("role", "user"),
            "stamps": []
        }
    except Exception:
        return None
