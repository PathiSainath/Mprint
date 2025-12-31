import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaBoxes, FaShippingFast, FaPercentage, FaHeadset, FaSearch, FaFilter } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";
import FilterSidebar from "./FilterSidebar";

const BulkOrdersPage = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter & Sort states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const isFiltered = selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max;

  const API_BASE_URL = "http://127.0.0.1:8000/api";

  // Bulk order categories
  const bulkCategories = [
    { id: "all", name: "All Products", icon: "📦" },
    { id: "cards", name: "Business Cards", icon: "💳" },
    { id: "brochures", name: "Brochures", icon: "📄" },
    { id: "certificates", name: "Certificates", icon: "📜" },
    { id: "posters", name: "Posters", icon: "🖼️" },
    { id: "frames", name: "Photo Frames", icon: "🖼️" },
    { id: "prints", name: "Photo Prints", icon: "📸" },
    { id: "personalised", name: "Personalised", icon: "✨" },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check user
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

  // Fetch all products
  useEffect(() => {
    fetchAllProducts();
  }, [sortBy, sortOrder]);

  // Filter products when search, category, or price changes
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        const categorySlug = product.category?.slug?.toLowerCase() || "";
        return categorySlug.includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.short_description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price || 0);
      return price >= selectedPriceRange[0] && price <= selectedPriceRange[1];
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'price') {
        aValue = parseFloat(a.price || 0);
        bValue = parseFloat(b.price || 0);
      } else if (sortBy === 'name') {
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
      } else {
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, selectedPriceRange, sortBy, sortOrder]);

  const fetchAllProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        per_page: 100,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        let productsData = [];

        if (data.data?.data) {
          productsData = data.data.data;
        } else if (Array.isArray(data.data)) {
          productsData = data.data;
        } else if (Array.isArray(data)) {
          productsData = data;
        }

        // Calculate price range from products
        if (productsData.length > 0) {
          const prices = productsData.map(p => parseFloat(p.price || 0));
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange({ min: minPrice, max: maxPrice });

          // Only set selected range on first load
          if (selectedPriceRange[0] === 0 && selectedPriceRange[1] === 10000) {
            setSelectedPriceRange([minPrice, maxPrice]);
          }
        }

        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load bulk products.");
    } finally {
      setLoading(false);
    }
  };

  const getProductImageUrl = (product) => {
    if (product.featured_image) {
      return `${API_BASE_URL.replace("/api", "")}/storage/${product.featured_image}`;
    }
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url ||
        `${API_BASE_URL.replace("/api", "")}/storage/${product.images[0].image_path}`;
    }
    if (product.image_url) {
      return product.image_url;
    }
    return "https://via.placeholder.com/400x300?text=Bulk+Product";
  };

  const getProductLink = (product) => {
    const categorySlug = product.category?.slug || "products";
    return `/${categorySlug}/${product.slug}`;
  };

  const getStartingPrice = (product) => {
    // Check for quantity pricing in attributes
    if (product.attributes) {
      const attrs = typeof product.attributes === 'string'
        ? JSON.parse(product.attributes)
        : product.attributes;

      if (attrs.quantity && Array.isArray(attrs.quantity) && attrs.quantity.length > 0) {
        const lowestTier = attrs.quantity[0];
        return {
          quantity: lowestTier.quantity,
          price: parseFloat(lowestTier.price || 0)
        };
      }
    }

    // Fallback to product price
    return {
      quantity: 1,
      price: parseFloat(product.price || 0)
    };
  };

  const getColorOptions = (product) => {
    if (product.attributes) {
      const attrs = typeof product.attributes === 'string'
        ? JSON.parse(product.attributes)
        : product.attributes;

      if (attrs.color && Array.isArray(attrs.color)) {
        return attrs.color.slice(0, 4); // Max 4 colors to display
      }
    }
    return [];
  };

  const handleToggleFavorite = async (e, productId) => {
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

    toggleFavorite(productId);
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
    setSearchQuery("");
    setSelectedCategory("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bulk products...</p>
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
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <FaBoxes size={40} />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Bulk Orders
                </h1>
              </div>
              <p className="text-lg md:text-xl text-orange-100 mb-6 max-w-xl">
                Get the best prices on large quantity orders. Perfect for businesses, events, and corporate needs.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaPercentage />
                  <span className="text-sm font-medium">Up to 40% Off</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaShippingFast />
                  <span className="text-sm font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaHeadset />
                  <span className="text-sm font-medium">Dedicated Support</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold">{filteredProducts.length}+</div>
                <div className="text-xs md:text-sm text-orange-100">Products</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold">100+</div>
                <div className="text-xs md:text-sm text-orange-100">Min. Qty</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold">24hr</div>
                <div className="text-xs md:text-sm text-orange-100">Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bulk products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose size={20} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              {bulkCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium
                    ${selectedCategory === cat.id
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      {isMobile && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaFilter size={16} />
              </div>
              <span className="font-bold text-lg">Price Filter & Sort</span>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                totalProducts={filteredProducts.length}
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
              totalProducts={filteredProducts.length}
              isMobile={true}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "all" ? "All Bulk Products" : bulkCategories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredProducts.length} products found
              </span>
            </div>

            {/* Products Grid - Vistaprint Style */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-gray-400 text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Products Found</h3>
                <p className="text-gray-600 mb-6">Try a different search, category, or price range</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const imageSrc = getProductImageUrl(product);
                  const productLink = getProductLink(product);
                  const startingPrice = getStartingPrice(product);
                  const colorOptions = getColorOptions(product);
                  const isFav = isFavorite(product.id);

                  return (
                    <div key={product.id} className="group">
                      <Link to={productLink}>
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-gray-50">
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x400?text=Product";
                              }}
                            />

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => handleToggleFavorite(e, product.id)}
                              className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
                            >
                              {isFav ? (
                                <FaHeart className="text-red-500" size={16} />
                              ) : (
                                <FaRegHeart className="text-gray-400" size={16} />
                              )}
                            </button>

                            {/* Color Options Overlay */}
                            {colorOptions.length > 0 && (
                              <div className="absolute bottom-3 left-3 flex gap-1">
                                {colorOptions.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value || '#ccc' }}
                                    title={color.name}
                                  />
                                ))}
                                {colorOptions.length >= 4 && (
                                  <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs text-gray-500">
                                    +
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm md:text-base group-hover:text-orange-600 transition-colors">
                              {product.name}
                            </h3>

                            {product.short_description && (
                              <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                {product.short_description}
                              </p>
                            )}

                            {/* Pricing */}
                            <div className="mt-2">
                              <div className="text-xs text-gray-500">
                                {startingPrice.quantity > 1 ? `${startingPrice.quantity} starting at` : "Starting at"}
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                ₹{startingPrice.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </div>
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

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Need a Custom Quote?</h3>
              <p className="text-gray-300">
                For orders above 5000+ units, contact us for special pricing and dedicated support.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="tel:02522669393"
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                <FaHeadset />
                Call Us
              </a>
              <Link
                to="/contact"
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                Get Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrdersPage;
