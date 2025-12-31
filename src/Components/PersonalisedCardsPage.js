import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaStar, FaUserEdit, FaFilter } from "react-icons/fa";
import api from "../api/api";
import FilterSidebar from "./FilterSidebar";

const PersonalisedCardsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const API_BASE_URL = "http://127.0.0.1:8000/api";

  // Filter & Sort states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Check if filters are active
  const isFiltered = selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userRes = await api.get("/api/user");
        setUser(userRes.data?.user ?? userRes.data?.data ?? null);
      } catch {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const response = await api.get("/api/favorites");
        if (response.data?.success && response.data.data) {
          const favoriteIds = response.data.data.map(fav => fav.product?.id).filter(Boolean);
          setFavorites(favoriteIds);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    fetchPersonalisedProducts();
  }, [selectedPriceRange, sortBy, sortOrder]);

  const fetchPersonalisedProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      // Only add price filters if they're different from the default range
      if (selectedPriceRange[0] !== priceRange.min) {
        params.append('min_price', selectedPriceRange[0]);
      }
      if (selectedPriceRange[1] !== priceRange.max) {
        params.append('max_price', selectedPriceRange[1]);
      }

      const response = await fetch(`${API_BASE_URL}/products/category/personalised-cards?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      let productsData = [];
      if (response.ok) {
        const data = await response.json();

        // Set price range from backend
        if (data.price_range) {
          const newRange = {
            min: Math.floor(data.price_range.min),
            max: Math.ceil(data.price_range.max)
          };
          setPriceRange(newRange);
          // Only set selected range on first load
          if (selectedPriceRange[0] === 0 && selectedPriceRange[1] === 10000) {
            setSelectedPriceRange([newRange.min, newRange.max]);
          }
        }

        if (data.data?.data) {
          productsData = data.data.data;
        } else {
          productsData = [];
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setProducts(productsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load personalised cards from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (newRange) => {
    setSelectedPriceRange(newRange);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleClearFilters = () => {
    setSelectedPriceRange([priceRange.min, priceRange.max]);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const getProductImageUrl = (product) => {
    if (product.featured_image) {
      return `${API_BASE_URL.replace("/api", "")}/storage/${product.featured_image}`;
    }
    if (product.images && product.images.length > 0) {
      return `${API_BASE_URL.replace("/api", "")}/storage/${product.images[0].image_path}`;
    }
    if (product.image_url) {
      return product.image_url;
    }
    return "https://via.placeholder.com/400x500?text=Personalised+Card";
  };

  const toggleFavorite = async (e, productId) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Please login to add products to favorites"
        }
      });
      return;
    }

    try {
      const response = await api.post("/api/favorites/toggle", {
        product_id: productId
      });

      if (response.data?.success) {
        if (response.data.is_favorited) {
          setFavorites([...favorites, productId]);
        } else {
          setFavorites(favorites.filter(id => id !== productId));
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(parseFloat(rating));
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />);
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" size={14} />);
    }
    return stars;
  };

  // Safely get array for sizes (avoid objects)
  const getSizes = (attributes) => {
    if (attributes && Array.isArray(attributes.sizes)) {
      return attributes.sizes;
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading personalised cards...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 bg-gradient-to-b from-indigo-50 to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎨 Custom Personalised Cards
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Unique personalised cards perfect for your occasions or business needs
          </p>
          <p className="text-sm text-indigo-600">
            Customized templates • Premium materials • Variety of styles and sizes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-indigo-600">{products.length}+</h3>
              <p className="text-sm text-gray-600">Personalised Items</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">Fast</h3>
              <p className="text-sm text-gray-600">Printing & Delivery</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-600">Custom</h3>
              <p className="text-sm text-gray-600">Design Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      {isMobile && (
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaFilter size={16} />
              </div>
              <span className="font-bold text-lg">Filters & Sort</span>
              {isFiltered && (
                <span className="ml-auto bg-white/30 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  Active
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0">
              <FilterSidebar
                priceRange={priceRange}
                selectedPriceRange={selectedPriceRange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onPriceChange={handlePriceChange}
                onSortChange={handleSortChange}
                onClearFilters={handleClearFilters}
                totalProducts={products.length}
                isMobile={false}
              />
            </div>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <FilterSidebar
              priceRange={priceRange}
              selectedPriceRange={selectedPriceRange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onPriceChange={handlePriceChange}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              totalProducts={products.length}
              isMobile={true}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 text-6xl mb-6">
                  <FaUserEdit />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  No Personalised Cards Found
                </h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or check back soon!</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-block"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const isFavorite = favorites.includes(product.id);
              const imageSrc = getProductImageUrl(product);
              const sizes = getSizes(product.attributes);

              return (
                <div key={product.id} className="group">
                  <Link to={`/personalised/${product.slug}`}>
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden border border-indigo-100">
                      <button
                        onClick={(e) => toggleFavorite(e, product.id)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                      >
                        {isFavorite ? (
                          <FaHeart className="text-red-500" size={16} />
                        ) : (
                          <FaRegHeart className="text-gray-600" size={16} />
                        )}
                      </button>
                      {/* Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.is_featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                        {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            {Math.round(((parseFloat(product.price) - parseFloat(product.sale_price)) / parseFloat(product.price)) * 100)}% OFF
                          </span>
                        )}
                        {product.name?.toLowerCase().includes("premium") && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                            Premium
                          </span>
                        )}
                      </div>
                      {/* Product Image */}
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x500?text=Personalised+Card";
                          }}
                        />
                      </div>
                      {/* Product Info */}
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h2>
                        {product.short_description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.short_description}
                          </p>
                        )}
                        {Array.isArray(sizes) && sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs text-gray-500">Sizes:</span>
                            {sizes.slice(0, 5).map((size, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {typeof size === 'string' || typeof size === 'number'
                                  ? size
                                  : JSON.stringify(size)}
                              </span>
                            ))}
                            {sizes.length > 5 && <span className="text-xs text-gray-500">+more</span>}
                          </div>
                        )}
                        {/* Only render primitive material */}
                        {product.attributes && typeof product.attributes.material === "string" && (
                          <div className="mb-3">
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {product.attributes.material}
                            </span>
                          </div>
                        )}
                        {parseFloat(product.rating) > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">{renderStarRating(product.rating)}</div>
                            <span className="text-sm text-gray-600">
                              {parseFloat(product.rating).toFixed(1)} ({product.reviews_count || 0})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-indigo-600">
                              ₹{parseFloat(product.price || 0).toFixed(2)}
                            </span>
                            {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{parseFloat(product.sale_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.stock_quantity !== undefined && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                parseInt(product.stock_quantity) > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {parseInt(product.stock_quantity) > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          )}
                        </div>
                        {/* Features */}
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span>Custom embroidery available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Premium quality materials</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalisedCardsPage;
