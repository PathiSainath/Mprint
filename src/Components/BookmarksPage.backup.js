import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite: toggleFavoriteContext } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const API_BASE_URL = "http://127.0.0.1:8000/api";

  // Check if user is logged in
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
    const fetchBookmarks = async () => {
      setLoading(true);
      setError("");
      try {
        // Try to fetch only bookmarks from the category endpoint.
        let response = await fetch(`${API_BASE_URL}/products/category/bookmarks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        let productsData = [];
        if (response.ok) {
          const data = await response.json();
          // Use the correct nested structure per your backend response
          if (data.data?.data) {
            productsData = data.data.data;
          } else {
            productsData = [];
          }
        } else {
          // Fallback: Fetch all products and filter client side.
          response = await fetch(`${API_BASE_URL}/products`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.data?.data) {
            productsData = data.data.data.filter(
              (product) => product.category && product.category.slug === "bookmarks"
            );
          } else {
            productsData = [];
          }
        }
        setProducts(productsData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load bookmarks from backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

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
    return "https://via.placeholder.com/400x300?text=Bookmarks";
  };

  const toggleFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Please login to add products to favorites"
        }
      });
      return;
    }

    // Use context toggle function for real-time sync
    await toggleFavoriteContext(productId);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(parseFloat(rating));
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />);
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300" size={14} />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Professional Bookmarks
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Make lasting impressions with premium business bookmarks
          </p>
          <p className="text-sm text-blue-600">
            Same day delivery available • Premium quality printing • Custom designs
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-blue-600">{products.length}+</h3>
              <p className="text-sm text-gray-600">Bookmark Designs</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600">24hr</h3>
              <p className="text-sm text-gray-600">Fast Delivery</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-600">4.7★</h3>
              <p className="text-sm text-gray-600">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-gray-400 text-6xl mb-6">📇</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            No Bookmarks Available
          </h3>
          <p className="text-gray-600 mb-6">
            We're working on adding amazing bookmarks. Check back soon!
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {products.map((product) => {
            const isProductFavorite = isFavorite(product.id);
            const imageSrc = getProductImageUrl(product);

            return (
              <div key={product.id} className="group">
                <Link to={`/bookmarks/${product.slug}`}>
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <button
                      onClick={(e) => toggleFavorite(e, product.id)}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                    >
                      {isProductFavorite ? (
                        <FaHeart className="text-red-500" size={16} />
                      ) : (
                        <FaRegHeart className="text-gray-600" size={16} />
                      )}
                    </button>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Bookmarks";
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h2>
                      {product.short_description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.short_description}
                        </p>
                      )}
                      {parseFloat(product.rating) > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {renderStarRating(product.rating)}
                          </div>
                          <span className="text-xs text-gray-600">
                            {parseFloat(product.rating).toFixed(1)} ({product.reviews_count || 0})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-blue-600">
                            ₹{parseFloat(product.price || 0).toFixed(2)}
                          </span>
                          {product.sale_price &&
                            parseFloat(product.sale_price) < parseFloat(product.price) && (
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
                            {parseInt(product.stock_quantity) > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        )}
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
  );
};

export default BookmarksPage;
