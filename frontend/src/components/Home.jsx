import React, { useState } from 'react';

const Home = () => {
  const [ingredients, setIngredients] = useState('');
  const [dietaryRestriction, setDietaryRestriction] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [status, setStatus] = useState("Waiting for input");

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
        // Render headings
        return <h2 key={index}>{line.replace(/\*\*/g, "")}</h2>;
      } else if (line.startsWith("*")) {
        // Render list items
        return <li key={index}>{line.replace(/\*/g, "")}</li>;
      } else {
        // Render paragraphs
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
      const token = localStorage.getItem("token"); // Retrieve token from local storage
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

  console.log("Fetched recipes:", recipes); // Debugging the recipes data

  return (
    <div className="container">
      <h1>🍽️ Recipe Generator</h1>

      {/* Input Section */}
      <div className="input-section">
        <h2>Generate Your Perfect Recipe</h2>
        <div className="input-row">
          <div className="form-group">
            <label>Ingredients</label>
            <input
              type="text"
              placeholder="Enter ingredients (comma separated)"
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
              <option value="">Any</option>
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
          <button onClick={handleFetchRecipes}>🔍 Get Recipes</button>
        </div>
        <div className="status-message">{status}</div>
      </div>

      {/* Status Indicator */}
      <div className="status-indicator">
        <p>Status: <strong>{status}</strong></p>
      </div>

      {/* Chat Assistant */}
      <div className="chat-assistant">
        <h2>🤖 AI Recipe Assistant</h2>
        <p style={{color: 'var(--text-light)', marginBottom: '1.5rem'}}>Ask me anything about cooking, ingredients, or recipes!</p>
        <div className="chat-input-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="Ask me about recipes, cooking tips, or ingredients..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            />
          </div>
          <button onClick={handleChat}>💬 Send</button>
        </div>
        <div className="ai-response">
          {chatResponse || <p className="loading">Ask me anything about recipes and cooking! 🍳</p>}
        </div>
      </div>

      {/* Saved Recipes Section */}
      <div className="input-section mt-4">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2>📚 Your Saved Cookbook</h2>
          <button onClick={handleFetchSavedRecipes}>📖 Show Saved Recipes</button>
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
                    <h3>📋 {String(title)}</h3>
                    <div className="recipe-meta">
                      {cuisine !== "Unknown" && <span className="recipe-tag">🍴 {String(cuisine)}</span>}
                      {dietary_restriction !== "None" && <span className="recipe-tag">🥗 {String(dietary_restriction)}</span>}
                    </div>
                    <div className="ingredients-list">
                      <strong>🛒 Ingredients:</strong>
                      <p>{formattedIngredients}</p>
                    </div>
                    <div className="instructions">
                      <strong>👨‍🍳 Instructions:</strong><br/><br/>
                      {String(instructions)}
                    </div>
                  </div>
                );
              } catch (error) {
                console.error("Error rendering recipe:", error, recipe);
                return null;
              }
            })
          ) : (
            <div className="text-center" style={{gridColumn: '1 / -1'}}>
              <p style={{color: 'var(--text-light)', fontSize: '1.2rem'}}>📚 No saved recipes yet. Generate some recipes and save your favorites!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;