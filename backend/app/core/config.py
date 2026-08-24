import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GanPass 2026 API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017/ganpass",
        description="MongoDB connection string (Atlas or local)"
    )
    DATABASE_NAME: str = Field(default="ganpass", description="MongoDB Database Name")

    # JWT Authentication
    JWT_SECRET: str = Field(
        default="ganpass_2026_production_secret_key_mumbai_sarvajanik_utsav_samiti_32",
        description="Secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Checkin Radius (in meters)
    CHECKIN_RADIUS_METERS: float = 150.0

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ganpass.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Initial Admin Seed
    ADMIN_INITIAL_EMAIL: str = "admin@ganpass.in"
    ADMIN_INITIAL_PASSWORD: str = "admin123"
    ADMIN_INITIAL_NAME: str = "Mandal Admin Officer"

    # Gemini AI
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"

settings = Settings()
