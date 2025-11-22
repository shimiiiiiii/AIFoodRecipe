from fastapi import FastAPI
from routes import recipes, auth
from fastapi.middleware.cors import CORSMiddleware

# MongoDB connection
from motor.motor_asyncio import AsyncIOMotorClient

# Update MongoDB connection string with placeholders for security
client = AsyncIOMotorClient("mongodb+srv://Tinkerbeads:Tinkerbeads@cluster0.p6nrbl6.mongodb.net/recipe_organizer?retryWrites=true&w=majority&appName=Cluster0")
db = client["recipe_organizer"]

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],    
)

@app.get("/")
async def read_root():
    return {"message": "Connected to MongoDB"}

# Router
app.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
# Include authentication router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])