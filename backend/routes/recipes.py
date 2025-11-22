from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from models.recipe import Recipe
import httpx
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

# MongoDB connection

client = AsyncIOMotorClient("mongodb+srv://Tinkerbeads:Tinkerbeads@cluster0.p6nrbl6.mongodb.net/recipe_organizer?retryWrites=true&w=majority&appName=Cluster0")
db = client["recipe_organizer"]
recipes_collection = db.recipes

# FastAPI router
router = APIRouter()

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "recipeisthekey"
ALGORITHM = "HS256"

def get_user_id_from_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/saved", response_model=List[Recipe])
async def get_saved_recipes(token: str = Depends(oauth2_scheme)):
    """
    Fetch saved recipes for the logged-in user.
    """
    user_id = get_user_id_from_token(token)
    recipes = await recipes_collection.find({"user_id": user_id}).to_list(100)
    return recipes

@router.post("/create", response_model=Recipe)
async def create_recipe(recipe: Recipe, token: str = Depends(oauth2_scheme)):
    """
    Create a new recipe and associate it with the logged-in user.
    """
    user_id = get_user_id_from_token(token)
    recipe_data = recipe.dict()
    recipe_data["user_id"] = user_id
    result = await recipes_collection.insert_one(recipe_data)
    if result.inserted_id:
        return recipe
    raise HTTPException(status_code=500, detail="Failed to create recipe")

@router.get("/read", response_model=List[Recipe])
async def get_recipes(user_id: Optional[str] = None):
    query = {"user_id": user_id} if user_id else {}
    recipes = await recipes_collection.find(query).to_list(100)
    return recipes

@router.get("/read/{recipe_id}", response_model=Recipe)
async def get_recipe(recipe_id: str):
    recipe = await recipes_collection.find_one({"_id": recipe_id})
    if recipe:
        return Recipe(**recipe)
    raise HTTPException(status_code=404, detail="Recipe not found")

@router.delete("/delete/{recipe_id}")
async def delete_recipe(recipe_id: str):
    result = await recipes_collection.delete_one({"_id": recipe_id})
    if result.deleted_count:
        return {"message": "Recipe deleted"}
    raise HTTPException(status_code=404, detail="Recipe not found")

@router.post("/suggest")
async def suggest_recipes(
    request: Request,
):
    try:
        # Log the incoming request for debugging
        payload = await request.json()
        print("Incoming suggest payload:", payload)

        # Extract user_id from token
        token = request.headers.get("Authorization").split(" ")[1]
        user_id = get_user_id_from_token(token)

        # Validate and process the payload
        ingredients = payload.get("ingredients", [])
        if isinstance(ingredients, str):
            ingredients = ingredients.split(",")

        dietary_restriction = payload.get("dietary_restriction", None)
        cuisine = payload.get("cuisine", None)

        # Groq API URL and Authorization
        groq_api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
        }

        # Construct the payload
        groq_payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": f"Generate recipes based on the following details:\nIngredients: {', '.join(ingredients)}\nDietary Restriction: {dietary_restriction or 'None'}\nCuisine: {cuisine or 'Any'}",
                }
            ],
        }

        # Make the API call
        async with httpx.AsyncClient() as client:
            response = await client.post(groq_api_url, json=groq_payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        # Extract the recipe content
        recipe_content = data.get("choices", [{}])[0].get("message", {}).get("content", "No recipes found")

        # Insert the recipe into the database
        recipe_data = {
            "title": f"Recipe generated for {', '.join(ingredients)}",
            "ingredients": ingredients,
            "instructions": recipe_content,
            "cuisine": cuisine,
            "dietary_restriction": dietary_restriction,
            "user_id": user_id,  # Associate with the logged-in user
        }
        result = await recipes_collection.insert_one(recipe_data)

        if result.inserted_id:
            return {"recipes": recipe_content, "message": "Recipe successfully generated and saved."}
        else:
            raise HTTPException(status_code=500, detail="Failed to save the recipe to the database.")

    except Exception as e:
        print("Error in suggest_recipes endpoint:", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching recipe suggestions: {str(e)}")

@router.post("/chat")
async def chat_with_ai(request: Request):
    try:
        # Log the incoming request for debugging
        payload = await request.json()
        print("Incoming chat payload:", payload)

        # Validate the query field
        query = payload.get("query")
        if not query:
            raise HTTPException(status_code=422, detail="Missing 'query' field in request body.")

        # Groq API URL and Authorization
        groq_api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
        }

        # Construct the payload
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": query,
                }
            ],
        }

        # Make the API call
        async with httpx.AsyncClient() as client:
            response = await client.post(groq_api_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        # Extract the AI response
        ai_response = data.get("choices", [{}])[0].get("message", {}).get("content", "No response from AI")
        return {"response": ai_response}

    except Exception as e:
        print("Error in chat_with_ai endpoint:", str(e))
        raise HTTPException(status_code=500, detail=f"Error processing chat query: {str(e)}")