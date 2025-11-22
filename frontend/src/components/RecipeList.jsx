import React, { useState, useEffect } from 'react';
import domToPdf from 'dom-to-pdf';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('');
  const [filterDietary, setFilterDietary] = useState('');

  const fetchAllRecipes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to view recipes.");
        return;
      }

      const response = await fetch("http://localhost:8000/recipes/saved", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const generatePDF = (recipeId) => {
    const recipeElement = document.getElementById(`recipe-${recipeId}`);

    // Temporarily expand scrollable content
    const scrollableElements = recipeElement.querySelectorAll('.scrollable');
    scrollableElements.forEach(el => {
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
    });

    const options = {
      filename: `${recipeElement.querySelector('h3').innerText}.pdf`,
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    domToPdf(recipeElement, options, () => {
      // Restore scrollable content
      scrollableElements.forEach(el => {
        el.style.overflow = 'auto';
        el.style.maxHeight = '';
      });

      alert('PDF downloaded successfully!');
    });
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine = !filterCuisine || recipe.cuisine === filterCuisine;
    const matchesDietary = !filterDietary || recipe.dietary_restriction === filterDietary;
    
    return matchesSearch && matchesCuisine && matchesDietary;
  });

  return (
    <div className="container">
      <h1>🍽️ Recipe Collection</h1>
      
      {/* Filter Section */}
      <div className="input-section">
        <h2>📋 Browse & Filter Recipes</h2>
        <div className="input-row">
          <div className="form-group">
            <label>🔍 Search Recipes</label>
            <input
              type="text"
              placeholder="Search by title or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>🍴 Filter by Cuisine</label>
            <select
              value={filterCuisine}
              onChange={(e) => setFilterCuisine(e.target.value)}
            >
              <option value="">All Cuisines</option>
              <option value="italian">Italian</option>
              <option value="mexican">Mexican</option>
              <option value="indian">Indian</option>
            </select>
          </div>
          <div className="form-group">
            <label>🥗 Filter by Diet</label>
            <select
              value={filterDietary}
              onChange={(e) => setFilterDietary(e.target.value)}
            >
              <option value="">All Diets</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="gluten-free">Gluten-Free</option>
            </select>
          </div>
          <button onClick={fetchAllRecipes}>🔄 Refresh</button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center">
          <p className="loading">Loading your delicious recipes... 🍳</p>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="recipe-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <div key={recipe._id || index} id={`recipe-${recipe._id || index}`} className="recipe-card">
              <h3>📄 {recipe.title}</h3>
              <div className="recipe-meta">
                {recipe.cuisine && <span className="recipe-tag">🍴 {recipe.cuisine}</span>}
                {recipe.dietary_restriction && <span className="recipe-tag">🥗 {recipe.dietary_restriction}</span>}
              </div>
              
              <div className="ingredients-list">
                <strong>🛒 Ingredients:</strong>
                <p>{Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}</p>
              </div>
              
              <div className="instructions scrollable">
                <strong>👨‍🍳 Instructions:</strong><br/><br/>
                {recipe.instructions}
              </div>

              <button onClick={() => generatePDF(recipe._id || index)} className="download-btn">📥 Download Recipe</button>
            </div>
          ))
        ) : !loading ? (
          <div className="text-center" style={{gridColumn: '1 / -1'}}>
            <p style={{color: 'var(--text-light)', fontSize: '1.2rem'}}>
              {searchTerm || filterCuisine || filterDietary 
                ? '🔍 No recipes match your current filters. Try adjusting your search!' 
                : '📚 No saved recipes found. Start by generating some recipes!'}
            </p>
          </div>
        ) : null}
      </div>

      {/* Recipe Stats */}
      {recipes.length > 0 && (
        <div className="input-section mt-4">
          <div className="text-center">
            <h3>📊 Your Recipe Stats</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
              <div className="card" style={{textAlign: 'center'}}>
                <h4 style={{color: 'var(--primary-color)'}}>{recipes.length}</h4>
                <p>Total Recipes</p>
              </div>
              <div className="card" style={{textAlign: 'center'}}>
                <h4 style={{color: 'var(--primary-color)'}}>{filteredRecipes.length}</h4>
                <p>Filtered Results</p>
              </div>
              <div className="card" style={{textAlign: 'center'}}>
                <h4 style={{color: 'var(--primary-color)'}}>
                  {[...new Set(recipes.map(r => r.cuisine).filter(Boolean))].length}
                </h4>
                <p>Cuisine Types</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;