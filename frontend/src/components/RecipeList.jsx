import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, UtensilsCrossed, Leaf, TrendingUp, Filter, Eye, X } from 'lucide-react';
import jsPDF from 'jspdf';
import '../assets/css/recipe.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('');
  const [filterDietary, setFilterDietary] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [headerImage, setHeaderImage] = useState('https://via.placeholder.com/1200x300/7c3aed/ffffff?text=Recipe+Collection');

  useEffect(() => {
    // Fetch header image
    const fetchHeaderImage = async () => {
      try {
        const response = await fetch('https://foodish-api.com/api/');
        const data = await response.json();
        setHeaderImage(data.image);
      } catch (error) {
        console.error('Error fetching header image:', error);
        setHeaderImage('https://via.placeholder.com/1200x300/7c3aed/ffffff?text=Recipe+Collection');
      }
    };
    fetchHeaderImage();
  }, []);

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
        if (response.status === 401) {
          localStorage.removeItem('token');
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        alert('Authentication failed. Please login again.');
        window.location.href = '/login';
      } else {
        alert("Failed to fetch recipes.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

const generatePDF = async (recipe) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 22;
    let yPosition = 20;

    // Orange theme colors
    const primaryOrange = [249, 115, 22];
    const lightOrange = [255, 247, 237];
    const textDark = [30, 30, 30];
    const textGray = [75, 75, 75];

    // Helper function to add image to PDF
    const addImageToPDF = (imageUrl, x, y, width, height) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            pdf.addImage(imgData, 'JPEG', x, y, width, height);
            resolve();
          } catch {
            resolve();
          }
        };
        img.onerror = () => resolve();
        img.src = imageUrl;
      });
    };

    // Professional Header
    pdf.setFillColor(...primaryOrange);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    // Decorative pattern
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    for (let i = 0; i < 10; i++) {
      pdf.circle(5 + i * 20, 10, 8, 'F');
    }
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIPE COLLECTION', margin, 18);
    
    // Date and time stamp
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${dateStr} ${timeStr}`, pageWidth - margin - 38, 18);
    
    yPosition = 45;

    // Recipe Title - Elegant
    pdf.setTextColor(...textDark);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(recipe.title, pageWidth - 2 * margin);
    titleLines.forEach((line, idx) => {
      pdf.text(line, margin, yPosition + (idx * 10));
    });
    yPosition += (titleLines.length * 10) + 3;
    
    // Elegant underline
    pdf.setDrawColor(...primaryOrange);
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition, margin + 50, yPosition);
    yPosition += 12;

    // Metadata badges - professional styling
    let badgeX = margin;
    
    if (recipe.cuisine) {
      pdf.setFillColor(...lightOrange);
      pdf.roundedRect(badgeX, yPosition - 4, 45, 11, 2, 2, 'F');
      
      pdf.setTextColor(...primaryOrange);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CUISINE:', badgeX + 4, yPosition + 3);
      
      pdf.setTextColor(...textDark);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const cuisineText = recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1);
      pdf.text(cuisineText, badgeX + 28, yPosition + 3);
      badgeX += 80;
    }
    
    if (recipe.dietary_restriction) {
      pdf.setFillColor(...lightOrange);
      pdf.roundedRect(badgeX, yPosition - 4, 45, 11, 2, 2, 'F');
      
      pdf.setTextColor(...primaryOrange);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DIETARY:', badgeX + 4, yPosition + 3);
      
      pdf.setTextColor(...textDark);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dietaryText = recipe.dietary_restriction.charAt(0).toUpperCase() + recipe.dietary_restriction.slice(1);
      pdf.text(dietaryText, badgeX + 28, yPosition + 3);
    }

    yPosition += 22;

    // Try to use recipe image or fetch a random one
    let imageUrl = recipe.image_url;
    if (!imageUrl) {
      try {
        const response = await fetch('https://foodish-api.com/api/');
        const data = await response.json();
        if (data.image) imageUrl = data.image;
      } catch {
        console.log('Could not fetch image');
      }
    }

    if (imageUrl) {
      const imageWidth = pageWidth - 2 * margin;
      const imageHeight = 75;
      
      // Image with shadow effect
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPosition, imageWidth, imageHeight, 3, 3);
      
      await addImageToPDF(imageUrl, margin, yPosition, imageWidth, imageHeight);
      yPosition += imageHeight + 18;
    }

    // Ingredients Section - Professional
    pdf.setFillColor(...lightOrange);
    pdf.roundedRect(margin - 3, yPosition - 6, pageWidth - 2 * margin + 6, 13, 2, 2, 'F');
    
    pdf.setTextColor(...primaryOrange);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INGREDIENTS', margin, yPosition);
    yPosition += 15;

    pdf.setTextColor(...textGray);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const ingredients = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients 
      : [String(recipe.ingredients)];
      
    ingredients.forEach((ingredient) => {
      if (yPosition > pageHeight - 45) {
        pdf.addPage();
        yPosition = 35;
      }
      
      // Bullet point
      pdf.setFillColor(...primaryOrange);
      pdf.circle(margin + 2, yPosition - 1.5, 1.5, 'F');
      
      const ingredientText = typeof ingredient === 'string' ? ingredient : String(ingredient);
      const ingredientLines = pdf.splitTextToSize(ingredientText, pageWidth - 2 * margin - 8);
      
      ingredientLines.forEach((line, idx) => {
        pdf.text(line, margin + 7, yPosition + (idx * 5));
      });
      yPosition += (ingredientLines.length * 5) + 4;
    });

    yPosition += 12;

    // Instructions Section - Professional
    if (yPosition > pageHeight - 70) {
      pdf.addPage();
      yPosition = 35;
    }
    
    pdf.setFillColor(...lightOrange);
    pdf.roundedRect(margin - 3, yPosition - 6, pageWidth - 2 * margin + 6, 13, 2, 2, 'F');
    
    pdf.setTextColor(...primaryOrange);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INSTRUCTIONS', margin, yPosition);
    yPosition += 15;

    pdf.setTextColor(...textGray);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const instructions = String(recipe.instructions);
    
    // Clean instruction parsing - remove existing numbers first
    const cleanedInstructions = instructions.replace(/^\d+\.\s*/gm, '');
    const instructionSteps = cleanedInstructions
      .split(/[\n\r]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && !s.startsWith('*'));
    
    instructionSteps.forEach((step, index) => {
      if (yPosition > pageHeight - 45) {
        pdf.addPage();
        yPosition = 35;
      }
      
      // Step number in circle
      pdf.setFillColor(...primaryOrange);
      pdf.circle(margin + 5, yPosition + 1, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const stepNum = String(index + 1);
      const textWidth = pdf.getTextWidth(stepNum);
      pdf.text(stepNum, margin + 5 - textWidth / 2, yPosition + 4);
      
      // Step text
      pdf.setTextColor(...textGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const stepLines = pdf.splitTextToSize(step, pageWidth - 2 * margin - 15);
      
      stepLines.forEach((line, idx) => {
        pdf.text(line, margin + 14, yPosition + 4 + (idx * 5));
      });
      yPosition += (stepLines.length * 5) + 8;
    });

    // Professional Footer on all pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 12;
      
      pdf.setFillColor(...primaryOrange);
      pdf.rect(0, footerY - 3, pageWidth, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Recipe Collection', margin, footerY + 4);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 22, footerY + 4);
    }

    // Download
    const filename = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(filename);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine = !filterCuisine || recipe.cuisine === filterCuisine;
    const matchesDietary = !filterDietary || recipe.dietary_restriction === filterDietary;
    
    return matchesSearch && matchesCuisine && matchesDietary;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCuisine('');
    setFilterDietary('');
  };

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="recipe-list-container">
      <div className="page-header-list">
        <div className="header-image-wrapper">
          {headerImage && (
            <img 
              src={headerImage} 
              alt="Recipe Collection" 
              className="header-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x300/7c3aed/ffffff?text=Recipe+Collection';
              }}
            />
          )}
          <div className="header-overlay"></div>
        </div>
        <div className="header-content-list">
          <h1>Recipe Collection</h1>
          <p className="subtitle-list">Browse and manage your saved recipes</p>
        </div>
      </div>

      <div className="content-wrapper-list">
        {/* Filter Section */}
        <div className="filter-card">
          <div className="filter-header">
            <div className="filter-title">
              <Filter size={24} className="filter-icon" />
              <div>
                <h2>Search & Filter</h2>
                <p>Find the perfect recipe from your collection</p>
              </div>
            </div>
            <button className="btn-refresh" onClick={fetchAllRecipes}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="filter-grid">
            <div className="form-group-list">
              <label>
                <Search size={16} />
                Search Recipes
              </label>
              <input
                type="text"
                placeholder="Search by title or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group-list">
              <label>
                <UtensilsCrossed size={16} />
                Cuisine Type
              </label>
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
            <div className="form-group-list">
              <label>
                <Leaf size={16} />
                Dietary Restriction
              </label>
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
          </div>

          {(searchTerm || filterCuisine || filterDietary) && (
            <div className="filter-actions">
              <button className="btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
              <span className="filter-count">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </span>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {recipes.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <UtensilsCrossed size={24} />
              </div>
              <div className="stat-content">
                <h3>{recipes.length}</h3>
                <p>Total Recipes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Search size={24} />
              </div>
              <div className="stat-content">
                <h3>{filteredRecipes.length}</h3>
                <p>Filtered Results</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>{[...new Set(recipes.map(r => r.cuisine).filter(Boolean))].length}</h3>
                <p>Cuisine Types</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading your delicious recipes...</p>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="recipes-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <div key={recipe._id || index}>
                {/* Visible Card */}
                <div className="recipe-card-list">
                  <div className="recipe-card-header">
                    <h3>{recipe.title}</h3>
                    <div className="recipe-tags-list">
                      {recipe.cuisine && (
                        <span className="tag-list">
                          <UtensilsCrossed size={14} />
                          {recipe.cuisine}
                        </span>
                      )}
                      {recipe.dietary_restriction && (
                        <span className="tag-list">
                          <Leaf size={14} />
                          {recipe.dietary_restriction}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Recipe Image */}
                  {recipe.image_url && (
                    <div className="recipe-image-container">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title}
                        className="recipe-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200/f97316/ffffff?text=Recipe+Image';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="recipe-body">
                    <div className="recipe-section">
                      <strong>Ingredients</strong>
                      <p className="ingredients-text preview-text">
                        {Array.isArray(recipe.ingredients) 
                          ? recipe.ingredients.join(", ").substring(0, 100) + "..." 
                          : String(recipe.ingredients).substring(0, 100) + "..."}
                      </p>
                    </div>
                    
                    <div className="recipe-section">
                      <strong>Instructions</strong>
                      <div className="instructions-text preview-text">
                        {String(recipe.instructions).substring(0, 120)}...
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-view-recipe"
                      onClick={() => openModal(recipe)}
                    >
                      <Eye size={16} />
                      View Full Recipe
                    </button>
                    <button 
                      onClick={() => generatePDF(recipe)} 
                      className="btn-download"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : !loading ? (
            <div className="empty-state-list">
              <UtensilsCrossed size={64} className="empty-icon-list" />
              <h3>
                {searchTerm || filterCuisine || filterDietary 
                  ? 'No recipes match your filters' 
                  : 'No saved recipes yet'}
              </h3>
              <p>
                {searchTerm || filterCuisine || filterDietary 
                  ? 'Try adjusting your search criteria or clear filters' 
                  : 'Start by generating some recipes from the home page!'}
              </p>
              {(searchTerm || filterCuisine || filterDietary) && (
                <button className="btn-primary-list" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecipe.title}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {/* Recipe Image in Modal */}
              {selectedRecipe.image_url && (
                <div className="modal-image-container">
                  <img 
                    src={selectedRecipe.image_url} 
                    alt={selectedRecipe.title}
                    className="modal-recipe-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x300/f97316/ffffff?text=Recipe+Image';
                    }}
                  />
                </div>
              )}
              
              <div className="modal-tags">
                {selectedRecipe.cuisine && (
                  <span className="modal-tag">
                    <UtensilsCrossed size={16} />
                    {selectedRecipe.cuisine}
                  </span>
                )}
                {selectedRecipe.dietary_restriction && (
                  <span className="modal-tag">
                    <Leaf size={16} />
                    {selectedRecipe.dietary_restriction}
                  </span>
                )}
              </div>
              
              <div className="modal-section">
                <h3>Ingredients</h3>
                <p>
                  {Array.isArray(selectedRecipe.ingredients)
                    ? selectedRecipe.ingredients.join(", ")
                    : String(selectedRecipe.ingredients)}
                </p>
              </div>

              <div className="modal-section">
                <h3>Instructions</h3>
                <p>{String(selectedRecipe.instructions)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;