from fastapi import APIRouter, HTTPException
from jose import jwt
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from models.user import User

client = AsyncIOMotorClient("mongodb+srv://Tinkerbeads:Tinkerbeads@cluster0.p6nrbl6.mongodb.net/recipe_organizer?retryWrites=true&w=majority&appName=Cluster0")
db = client["recipe_organizer"]
users_collection = db.users

SECRET_KEY = "recipeisthekey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()
crypt_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    try:
        return crypt_context.hash(password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password hashing failed: {str(e)}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return crypt_context.verify(plain_password, hashed_password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password verification failed: {str(e)}")

@router.post("/register")
async def register(user: dict):
    existing_user = await users_collection.find_one({"$or": [
        {"username": user["username"]},
        {"email": user["email"]}
    ]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already taken")

    hashed_password = hash_password(user["password"])
    user_data = {
        "username": user["username"],
        "email": user["email"],
        "full_name": user.get("full_name"),
        "hashed_password": hashed_password,
        "disabled": user.get("disabled", False),
    }
    await users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(credentials: dict):
    username = credentials.get("username")
    password = credentials.get("password")

    if not username or not password:
        raise HTTPException(status_code=422, detail="Username and password are required")

    db_user = await users_collection.find_one({"username": username})
    if not db_user or not verify_password(password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}