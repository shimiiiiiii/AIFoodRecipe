from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    hashed_password: str
    disabled: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    hashed_password: str