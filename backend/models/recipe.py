from pydantic import BaseModel, Field
from typing import List, Optional

class Recipe(BaseModel):
    user_id: Optional[str] = None
    title: str = Field(..., min_length=1, description="The title of the recipe")
    ingredients: List[str] = Field(..., min_items=1, description="List of ingredients")
    instructions: str = Field(..., min_length=1, description="Step-by-step instructions")
    cuisine: Optional[str] = Field(None, description="Cuisine type (e.g., Italian, Mexican)")
    dietary_restriction: Optional[str] = Field(None, description="Dietary restriction (e.g., Vegan, Gluten-Free)")