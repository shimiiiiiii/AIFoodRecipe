import React, { useState } from 'react';
import { Search, Send, BookOpen, UtensilsCrossed, Leaf, Eye, X } from 'lucide-react';
import HeroCarousel from './Hero';
import '../assets/css/home.css';

const Home = () => {
  const [ingredients, setIngredients] = useState('');
  const [dietaryRestriction, setDietaryRestriction] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [status, setStatus] = useState("Waiting for input");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleFetchRecipes = async () => {
    try {
      setStatus("Generating recipes...");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not logged in.");
        setStatus("Waiting for input");
        return;
      }
      const response = await fetch("http://localhost:8000/recipes/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: ingredients ? ingredients.split(",") : [],
          dietary_restriction: dietaryRestriction || null,
          cuisine: cuisine || null,
        }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.recipes) {
        setRecipes(data.recipes.split("\n"));
        setStatus("Done");
      } else {
        setRecipes([]);
        setStatus("No recipes found");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Please try again.");
      setStatus("Waiting for input");
    }
  };

  const formatAIResponse = (response) => {
    const lines = response.split("\n");
    const formattedResponse = lines.map((line, index) => {
      if (line.startsWith("**")) {
        return <h2 key={index}>{line.replace(/\*\*/g, "")}</h2>;
      } else if (line.startsWith("*")) {
        return <li key={index}>{line.replace(/\*/g, "")}</li>;
      } else {
        return <p key={index}>{line}</p>;
      }
    });
    return formattedResponse;
  };

  const handleChat = async () => {
    try {
      const response = await fetch("http://localhost:8000/recipes/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: chatQuery }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setChatResponse(formatAIResponse(data.response));
    } catch (error) {
      console.error("Error in chat:", error);
      alert("Failed to process chat query. Please try again.");
    }
  };

  const handleFetchSavedRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not logged in.");
        return;
      }
      const response = await fetch("http://localhost:8000/recipes/saved", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      alert("Failed to fetch saved recipes. Please try again.");
    }
  };

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="app-container">
      <HeroCarousel />

      <div className="content-wrapper">
        <div className="section-card">
          <div className="section-header">
            <UtensilsCrossed size={24} className="section-icon" />
            <div>
              <h2>Generate Recipe</h2>
              <p>Enter your ingredients and preferences to get started</p>
            </div>
          </div>
          <div className="input-grid">
            <div className="form-group">
              <label>Ingredients</label>
              <input
                type="text"
                placeholder="e.g., chicken, tomatoes, garlic"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Dietary Restrictions</label>
              <select
                value={dietaryRestriction}
                onChange={(e) => setDietaryRestriction(e.target.value)}
              >
                <option value="">None</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cuisine Type</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                <option value="">Any</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
              </select>
            </div>
          </div>
          <div className="action-row">
            <button className="btn-primary" onClick={handleFetchRecipes}>
              <Search size={18} />
              Generate Recipes
            </button>
            <div className="status-badge">
              <span className={`status-dot ${status === 'Done' ? 'success' : status === 'Generating recipes...' ? 'loading' : ''}`}></span>
              {status}
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <Send size={24} className="section-icon" />
            <div>
              <h2>AI Recipe Assistant</h2>
              <p>Get instant answers to your cooking questions</p>
            </div>
          </div>
          <div className="chat-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Ask about recipes, ingredients, or cooking techniques..."
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              />
              <button className="btn-icon" onClick={handleChat}>
                <Send size={20} />
              </button>
            </div>
            {chatResponse && (
              <div className="chat-response">
                {chatResponse}
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header-row">
            <div className="section-header">
              <BookOpen size={24} className="section-icon" />
              <div>
                <h2>Saved Recipes</h2>
                <p>Your personal recipe collection</p>
              </div>
            </div>
            <button className="btn-secondary" onClick={handleFetchSavedRecipes}>
              <BookOpen size={18} />
              Load Saved Recipes
            </button>
          </div>
          <div className="recipe-grid">
            {recipes.filter(recipe => typeof recipe === "object" && recipe !== null).length > 0 ? (
              recipes.filter(recipe => typeof recipe === "object" && recipe !== null).map((recipe, index) => {
                try {
                  const {
                    title = "Untitled Recipe",
                    ingredients = [],
                    instructions = "No instructions provided.",
                    cuisine = "Unknown",
                    dietary_restriction = "None",
                  } = recipe;
                  const formattedIngredients = Array.isArray(ingredients)
                    ? ingredients.join(", ")
                    : String(ingredients || "N/A");
                  return (
                    <div key={recipe._id || index} className="recipe-card">
                      <div className="recipe-header">
                        <h3>{String(title)}</h3>
                        <div className="recipe-tags">
                          {cuisine !== "Unknown" && (
                            <span className="tag">
                              <UtensilsCrossed size={14} />
                              {String(cuisine)}
                            </span>
                          )}
                          {dietary_restriction !== "None" && (
                            <span className="tag">
                              <Leaf size={14} />
                              {String(dietary_restriction)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="recipe-preview">
                        <div className="preview-section">
                          <strong>Ingredients</strong>
                          <p className="preview-text">{formattedIngredients}</p>
                        </div>
                        <div className="preview-section">
                          <strong>Instructions</strong>
                          <p className="preview-text">{String(instructions).substring(0, 120)}...</p>
                        </div>
                      </div>
                      <button className="btn-view" onClick={() => openModal(recipe)}>
                        <Eye size={16} />
                        View Full Recipe
                      </button>
                    </div>
                  );
                } catch (error) {
                  console.error("Error rendering recipe:", error, recipe);
                  return null;
                }
              })
            ) : (
              <div className="empty-state">
                <BookOpen size={48} className="empty-icon" />
                <p>No saved recipes yet</p>
                <span>Generate recipes and save your favorites to build your collection</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{String(selectedRecipe.title || "Untitled Recipe")}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-tags">
                {selectedRecipe.cuisine && selectedRecipe.cuisine !== "Unknown" && (
                  <span className="modal-tag">
                    <UtensilsCrossed size={16} />
                    {String(selectedRecipe.cuisine)}
                  </span>
                )}
                {selectedRecipe.dietary_restriction && selectedRecipe.dietary_restriction !== "None" && (
                  <span className="modal-tag">
                    <Leaf size={16} />
                    {String(selectedRecipe.dietary_restriction)}
                  </span>
                )}
              </div>
              
              <div className="modal-section">
                <h3>Ingredients</h3>
                <p>
                  {Array.isArray(selectedRecipe.ingredients)
                    ? selectedRecipe.ingredients.join(", ")
                    : String(selectedRecipe.ingredients || "N/A")}
                </p>
              </div>

              <div className="modal-section">
                <h3>Instructions</h3>
                <p>{String(selectedRecipe.instructions || "No instructions provided.")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;