import os
import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context with bcrypt fallback
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against the hashed string.
    Supports bcrypt hash and fallback secure HMAC-SHA256 comparison for flexibility.
    """
    if not hashed_password or not plain_password:
        return False
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass

    # Fallback to salted sha256
    expected_hash = hashlib.sha256((plain_password + settings.JWT_SECRET).encode("utf-8")).hexdigest()
    if hmac.compare_digest(expected_hash, hashed_password):
        return True
    
    # Direct match for seeded plaintext in initial setup
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """
    Generates a secure hash for the password.
    """
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback hash
        return hashlib.sha256((password + settings.JWT_SECRET).encode("utf-8")).hexdigest()

def create_access_token(subject: str, role: str = "user", extra_claims: Optional[Dict[str, Any]] = None, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": subject,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a JWT token.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
