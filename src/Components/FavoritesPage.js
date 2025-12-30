import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaHeart,
  FaTrash,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaSort,
  FaFilter,
  FaTimes
} from "react-icons/fa";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, clearAllFavorites, fetchFavorites } = useFavorites();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const checkUserAndFetchFavorites = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");

        // Check if user is logged in
        try {
          const userRes = await api.get("/api/user");
          const userData = userRes.data?.user ?? userRes.data?.data ?? null;
          setUser(userData);

          if (userData) {
            // Fetch favorites using context
            await fetchFavorites();
          } else {
            // Not logged in, redirect to login
            navigate("/login", {
              state: {
                from: "/favorites",
                message: "Please login to view your favorites"
              }
            });
          }
        } catch {
          // Not logged in, redirect to login
          navigate("/login", {
            state: {
              from: "/favorites",
              message: "Please login to view your favorites"
            }
          });
        }
      } catch (err) {
        setError("Failed to load favorites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchFavorites();
  }, [navigate, fetchFavorites]);

  const handleRemoveFavorite = async (productId) => {
    const result = await removeFromFavorites(productId);
    if (result.success) {
      setSuccess("Product removed from favorites");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message || "Failed to remove from favorites");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all favorites?")) {
      return;
    }

    const result = await clearAllFavorites();
    if (result.success) {
      setSuccess("All favorites cleared");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message || "Failed to clear favorites");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => new Set([...prev, product.id]));
    try {
      await api.get("/sanctum/csrf-cookie");
      const response = await api.post("/api/cart/add", {
        product_id: product.id,
        quantity: 1
      });

      if (response.data?.success) {
        setSuccess(`${product.name} added to cart!`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const handleAddAllToCart = async () => {
    if (favorites.length === 0) return;

    const inStockProducts = favorites.filter(fav => {
      // Favorites are product objects directly
      return fav.stock_quantity > 0;
    });

    if (inStockProducts.length === 0) {
      setError("No in-stock products to add to cart");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm(`Add ${inStockProducts.length} in-stock products to cart?`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const product of inStockProducts) {
      // Favorites are product objects directly
      try {
        await api.get("/sanctum/csrf-cookie");
        await api.post("/api/cart/add", {
          product_id: product.id,
          quantity: 1
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setLoading(false);
    if (successCount > 0) {
      setSuccess(`${successCount} products added to cart!`);
      setTimeout(() => setSuccess(""), 3000);
    }
    if (failCount > 0) {
      setError(`${failCount} products failed to add`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleProductClick = (product) => {
    const categoryPath = product.category?.path || `/products`;
    navigate(`${categoryPath}/${product.slug}`);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  // Get unique categories from favorites
  const categories = [...new Set(favorites.map(fav => {
    // Favorites are product objects directly
    return fav.category?.name;
  }).filter(Boolean))];

  // Apply filters and sorting
  const getFilteredAndSortedFavorites = () => {
    let filtered = [...favorites];

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(fav => {
        // Favorites are product objects directly
        return fav.category?.name === filterCategory;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Favorites are product objects directly
      switch (sortBy) {
        case "price-low":
          return (a.sale_price || a.price) - (b.sale_price || b.price);
        case "price-high":
          return (b.sale_price || b.price) - (a.sale_price || a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return b.id - a.id;
      }
    });

    return filtered;
  };

  const displayFavorites = getFilteredAndSortedFavorites();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaHeart className="text-red-500" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                <p className="text-gray-600 mt-1">
                  {displayFavorites.length} of {favorites.length} {favorites.length === 1 ? "product" : "products"}
                  {filterCategory !== "all" && ` in ${filterCategory}`}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {favorites.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddAllToCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <FaShoppingCart size={16} />
                  Add All to Cart
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-2"
                >
                  <FaTrash size={16} />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Filters and Sort */}
          {favorites.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-gray-700"
                >
                  <FaSort size={14} />
                  Sort: {sortBy === "newest" && "Newest"}
                  {sortBy === "price-low" && "Price: Low to High"}
                  {sortBy === "price-high" && "Price: High to Low"}
                  {sortBy === "name" && "Name"}
                </button>
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                    <button
                      onClick={() => {
                        setSortBy("newest");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("price-low");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("price-high");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Name (A-Z)
                    </button>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-gray-700"
                  >
                    <FaFilter size={14} />
                    Category: {filterCategory === "all" ? "All" : filterCategory}
                  </button>
                  {showFilterMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setFilterCategory("all");
                          setShowFilterMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium"
                      >
                        All Categories
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setShowFilterMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Filter Badge */}
              {filterCategory !== "all" && (
                <button
                  onClick={() => setFilterCategory("all")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                >
                  <FaTimes size={12} />
                  Clear Filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <FaHeart className="mx-auto text-gray-300 mb-6" size={80} />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your favorites by clicking the heart icon on product pages
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : displayFavorites.length === 0 ? (
          <div className="text-center py-20">
            <FaFilter className="mx-auto text-gray-300 mb-6" size={60} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No products match your filter
            </h2>
            <button
              onClick={() => setFilterCategory("all")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayFavorites.map((favorite) => {
              // The API returns product objects directly, not favorites with nested products
              const product = favorite;
              const isAddingToCart = addingToCart.has(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-red-50 transition"
                    title="Remove from favorites"
                  >
                    <FaHeart className="text-red-500" size={20} />
                  </button>

                  {/* Product Image */}
                  <div
                    onClick={() => handleProductClick(product)}
                    className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={
                        product.featured_image_url ||
                        `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(
                          product.name
                        )}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(
                          product.name
                        )}`;
                      }}
                    />
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3
                      onClick={() => handleProductClick(product)}
                      className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-blue-600 transition"
                    >
                      {product.name}
                    </h3>

                    {/* Category */}
                    {product.category && (
                      <p className="text-xs text-gray-500 mb-2">
                        {product.category.name}
                      </p>
                    )}

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                          {renderStarRating(parseFloat(product.rating))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                          ({product.reviews_count || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.sale_price ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{parseFloat(product.sale_price).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {product.stock_quantity > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Action Buttons - Amazon Style */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity <= 0 || isAddingToCart}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                          product.stock_quantity > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FaShoppingCart size={14} />
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(product.id);
                        }}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FaTrash size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
