from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    name: str
    email: EmailStr
    whatsapp: Optional[str] = None
    role: str = "user"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    whatsapp: Optional[str] = ""
    password: Optional[str] = "devotee123"

class UserLogin(BaseModel):
    email: EmailStr
    password: Optional[str] = ""

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    stamps: List[str] = []
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int
