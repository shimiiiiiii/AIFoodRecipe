import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../assets/css/hero.css';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [foodImages, setFoodImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch random food images
  useEffect(() => {
    const fetchFoodImages = async () => {
      try {
        const foodCategories = [
          { category: 'burger', title: 'Juicy Burgers', description: 'Discover mouthwatering burger recipes' },
          { category: 'pizza', title: 'Perfect Pizza', description: 'Create authentic Italian pizzas at home' },
          { category: 'pasta', title: 'Classic Pasta', description: 'Master the art of pasta making' },
          { category: 'dessert', title: 'Sweet Desserts', description: 'Indulge in delicious dessert recipes' },
          { category: 'biryani', title: 'Aromatic Biryani', description: 'Explore flavorful rice dishes' }
        ];

        const images = await Promise.all(
          foodCategories.map(async (item, index) => {
            try {
              // Using Foodish API - free and reliable
              const response = await fetch(`https://foodish-api.com/api/images/${item.category}`);
              const data = await response.json();
              return {
                id: index,
                url: data.image,
                title: item.title,
                description: item.description
              };
            } catch (error) {
              console.error(`Error fetching ${item.category}:`, error);
              // Fallback to placeholder
              return {
                id: index,
                url: `https://via.placeholder.com/800x400/7c3aed/ffffff?text=${item.title}`,
                title: item.title,
                description: item.description
              };
            }
          })
        );
        
        setFoodImages(images);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching food images:', error);
        // Fallback images with placeholders
        setFoodImages([
          {
            id: 1,
            url: 'https://via.placeholder.com/800x400/7c3aed/ffffff?text=Italian+Delights',
            title: 'Italian Delights',
            description: 'Discover amazing pasta recipes'
          },
          {
            id: 2,
            url: 'https://via.placeholder.com/800x400/7c3aed/ffffff?text=Japanese+Cuisine',
            title: 'Japanese Cuisine',
            description: 'Explore authentic sushi recipes'
          },
          {
            id: 3,
            url: 'https://via.placeholder.com/800x400/7c3aed/ffffff?text=Sweet+Treats',
            title: 'Sweet Treats',
            description: 'Indulge in delicious desserts'
          }
        ]);
        setIsLoading(false);
      }
    };

    fetchFoodImages();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (foodImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % foodImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [foodImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % foodImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + foodImages.length) % foodImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="hero-carousel loading">
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Loading delicious images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {foodImages.map((image) => (
            <div key={image.id} className="carousel-slide">
              <div className="slide-image-wrapper">
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="slide-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/800x400/7c3aed/ffffff?text=${encodeURIComponent(image.title)}`;
                  }}
                />
                <div className="slide-overlay"></div>
              </div>
              <div className="slide-content">
                <h2>{image.title}</h2>
                <p>{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="carousel-arrow carousel-arrow-left" 
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          className="carousel-arrow carousel-arrow-right" 
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={32} />
        </button>

        <div className="carousel-dots">
          {foodImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;