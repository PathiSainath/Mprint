import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaStar, FaBoxes, FaFilter } from 'react-icons/fa';
import api from "../api/api";
import FilterSidebar from "./FilterSidebar";

const PrintsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Filter & Sort states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const isFiltered = selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max;

  const API_BASE_URL = "http://127.0.0.1:8000/api";

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
    fetchPrintsProducts();
  }, [selectedPriceRange, sortBy, sortOrder]);

  const fetchPrintsProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (selectedPriceRange[0] !== priceRange.min) {
        params.append('min_price', selectedPriceRange[0]);
      }
      if (selectedPriceRange[1] !== priceRange.max) {
        params.append('max_price', selectedPriceRange[1]);
      }

      const response = await fetch(`${API_BASE_URL}/products/category/photo-Prints?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.price_range) {
        const newRange = {
          min: Math.floor(data.price_range.min),
          max: Math.ceil(data.price_range.max)
        };
        setPriceRange(newRange);
        if (selectedPriceRange[0] === 0 && selectedPriceRange[1] === 10000) {
          setSelectedPriceRange([newRange.min, newRange.max]);
        }
      }

      if (data.data && data.data.data) {
        setProducts(data.data.data);
      } else if (data.data) {
        setProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load photo prints products from backend.");
    } finally {
      setLoading(false);
    }
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
    return "https://via.placeholder.com/400x300?text=Photo+Prints";
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

  const getBulkPrice = (originalPrice) =>
    (parseFloat(originalPrice) * 0.8).toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photo prints products...</p>
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
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 bg-gradient-to-b from-cyan-50 to-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Photo Prints & Bulk Orders</h1>
          <p className="text-lg text-gray-600 mb-2">
            High-quality photo printing solutions with bulk discounts for all your needs
          </p>
          <p className="text-sm text-cyan-600">
            Volume discounts • Fast turnaround • Corporate accounts • Dedicated support
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-cyan-600">{products.length}+</h3>
              <p className="text-sm text-gray-600">Print Options</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600">20%</h3>
              <p className="text-sm text-gray-600">Bulk Discount</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-600">Fast</h3>
              <p className="text-sm text-gray-600">Turnaround</p>
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
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-600 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
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

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 text-6xl mb-6">
                  <FaBoxes className="mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Photo Prints Available</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or check back soon!</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition inline-block"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const isFavorite = favorites.includes(product.id);
                  const imageSrc = getProductImageUrl(product);
                  const bulkPrice = getBulkPrice(product.price);

                  return (
                    <div key={product.id} className="group">
                      <Link to={`/Prints/${product.slug}`}>
                        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden border border-cyan-100">
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
                          <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x300?text=Photo+Prints";
                              }}
                            />
                          </div>
                          <div className="p-5">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                              {product.name}
                            </h2>
                            {product.short_description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.short_description}</p>
                            )}
                            {parseFloat(product.rating) > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1">{renderStarRating(product.rating)}</div>
                                <span className="text-sm text-gray-600">
                                  {parseFloat(product.rating).toFixed(1)} ({product.reviews_count || 0})
                                </span>
                              </div>
                            )}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Regular Price:</span>
                                <span className="text-lg font-bold text-gray-800">
                                  ₹{parseFloat(product.price || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-cyan-600 font-medium">Bulk Price (100+):</span>
                                <span className="text-xl font-bold text-cyan-600">₹{bulkPrice}</span>
                              </div>
                              <div className="text-xs text-green-600 text-right mt-1">
                                Save ₹{(parseFloat(product.price) - parseFloat(bulkPrice)).toFixed(2)} each
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Available:</span>
                              <span
                                className={`text-sm font-medium ${parseInt(product.stock_quantity) >= 500 ? "text-green-600" : "text-orange-600"
                                  }`}
                              >
                                {product.stock_quantity || 0} units
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintsPage;
