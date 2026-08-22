import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.api.v1 import api_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ganpass.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing GanPass 2026 Backend...")
    await connect_to_mongo()
    db = get_database()
    if db is not None:
        # Check and seed initial admin if not present
        try:
            from app.core.security import get_password_hash
            from datetime import datetime, timezone
            admin_email = settings.ADMIN_INITIAL_EMAIL.lower()
            existing_admin = await db.users.find_one({"email": admin_email})
            if not existing_admin:
                now_iso = datetime.now(timezone.utc).isoformat()
                await db.users.insert_one({
                    "id": "admin-super",
                    "name": settings.ADMIN_INITIAL_NAME,
                    "email": admin_email,
                    "whatsapp": "+91 98200 99999",
                    "role": "admin",
                    "password_hash": get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
                    "created_at": now_iso,
                    "updated_at": now_iso,
                })
                logger.info(f"Seeded default Mandal Admin: {admin_email}")
        except Exception as e:
            logger.warning(f"Admin seed notice: {e}")
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Official REST & AI API for Mumbai Sarvajanik Ganeshotsav GanPass 2026",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Custom Exception Handlers for clean standard error formats
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Validation error")
    loc = " -> ".join([str(l) for l in first_error.get("loc", [])])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"{loc}: {msg}" if loc else msg,
                "details": errors
            }
        }
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    db = get_database()
    db_connected = False
    if db is not None:
        try:
            await db.command("ping")
            db_connected = True
        except Exception:
            db_connected = False

    return {
        "status": "healthy",
        "service": "ganpass-backend",
        "version": settings.VERSION,
        "database_connected": db_connected
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to GanPass 2026 Official API Gateway",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }


origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "ganpass-47pt8zhac-mg-goyals-projects.vercel.app",  # Replace with your actual Vercel domain
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)