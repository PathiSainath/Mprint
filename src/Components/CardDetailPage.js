import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { IoChevronDown, IoCheckmarkCircle, IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";

const categoryRoutesMap = {
  bookmarks: "bookmarks",
  brochures: "brochures",
  cards: "cards",
  certificates: "certificates",
  stationery: "stationery",
  stamps: "stamps",
  labels: "labels",
  greetingcards: "greetingcards",
  personalised: "personalised",
  frames: "frames",
  posters: "posters",
  prints: "prints",
  drinkware: "drinkware",
  gifts: "gifts",
  bulkorders: "bulk-orders",
};

const CardDetailPage = () => {
  const { slug, category } = useParams(); // Expected route: /:category/:slug
  const navigate = useNavigate();
  const { isFavorite: isFavoritedGlobal, toggleFavorite: toggleFavoriteGlobal } = useFavorites();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [cart, setCart] = useState([]);

  const [attributes, setAttributes] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        // Validate category param and derive API endpoint path accordingly
        const apiCategory = categoryRoutesMap[category] || category;

        const response = await api.get(`/api/products/${slug}?category=${apiCategory}`);

        if (response.data?.success && response.data?.data) {
          const productData = response.data.data;
          setProduct(productData);

          const images = [];
          if (productData.featured_image_url) {
            images.push({
              id: "featured",
              url: productData.featured_image_url,
              alt: productData.name + " - Featured Image",
              is_primary: true,
            });
          }
          if (productData.images && productData.images.length > 0) {
            productData.images.forEach((img, index) => {
              if (img.is_primary && productData.featured_image_url) return;
              images.push({
                id: img.id || `gallery-${index}`,
                url: img.image_url,
                alt: img.alt_text || productData.name,
                is_primary: img.is_primary || false,
                sort_order: img.sort_order || index,
              });
            });
          }
          if (images.length === 0) {
            images.push({
              id: "placeholder",
              url: `https://via.placeholder.com/500x500/f3f4f6/9ca3af?text=${encodeURIComponent(productData.name)}`,
              alt: productData.name + " - No Image Available",
              is_primary: true,
            });
          }
          images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setAllImages(images);

          if (productData.attributes && typeof productData.attributes === "object") {
            setAttributes(productData.attributes);

            const defaults = {};
            Object.entries(productData.attributes).forEach(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                const firstOption = value[0];
                defaults[key] = firstOption.id || firstOption.value || firstOption.quantity || firstOption;
              }
            });
            setSelectedAttributes(defaults);
          }
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug, category]);

  useEffect(() => {
    const savedCart = localStorage.getItem("ecommerce_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    // Check if user is logged in
    const checkUser = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");
        const userRes = await api.get("/api/user");
        setUser(userRes.data?.user ?? userRes.data?.data ?? null);
      } catch {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  // Get favorite status from context
  const isFavorite = product ? isFavoritedGlobal(product.id) : false;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const selectedPrice = getSelectedPrice();

      await api.get("/sanctum/csrf-cookie"); // CSRF + session

      const cartPayload = {
        product_id: product.id,
        quantity: selectedPrice.quantity,
        selected_attributes: selectedAttributes,
      };

      const response = await api.post("/api/cart/add", cartPayload);
      if (response.data?.success) {
        setSuccess("✅ Product added to cart successfully!");
        setTimeout(() => setSuccess(""), 3000);

        const cartItem = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category?.name,
          price: selectedPrice.total,
          unitPrice: selectedPrice.unit,
          quantity: selectedPrice.quantity,
          selectedAttributes: selectedAttributes,
          image: allImages[0]?.url,
          addedAt: new Date().toISOString(),
        };

        const newCart = [...cart, cartItem];
        setCart(newCart);
        localStorage.setItem("ecommerce_cart", JSON.stringify(newCart));
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to add to cart. Please try again.";
      setError(errorMsg);
      setTimeout(() => setError(""), 3000);
    }
  };

  const toggleFavorite = async () => {
    // Check if user is logged in
    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Please login to add products to favorites"
        }
      });
      return;
    }

    if (!product) {
      return;
    }

    // Use context toggle function
    const result = await toggleFavoriteGlobal(product.id);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message || "Failed to update favorites");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAttributeChange = (attributeName, value) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: value }));
  };

  const formatLabel = (name) => name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const getSelectedPrice = () => {
    const quantityAttr = attributes.quantity || attributes.pricing_tiers;
    if (!quantityAttr || !Array.isArray(quantityAttr)) {
      return {
        total: parseFloat(product?.price || 0),
        unit: parseFloat(product?.price || 0),
        quantity: 1,
      };
    }

    const selectedQty = selectedAttributes.quantity || selectedAttributes.pricing_tiers;
    const tier = quantityAttr.find(
      (t) => String(t.quantity) === String(selectedQty) || t.id === selectedQty
    );

    if (tier) {
      let basePrice = parseFloat(tier.price || 0);
      let unitPrice = parseFloat(tier.unitPrice || tier.price || 0);

      Object.entries(selectedAttributes).forEach(([key, value]) => {
        if (key === "quantity" || key === "pricing_tiers") return;
        const attrOptions = attributes[key];
        if (attrOptions && Array.isArray(attrOptions)) {
          const selectedOption = attrOptions.find((opt) => (opt.id || opt.value) === value);
          if (selectedOption && selectedOption.price) {
            const additionalPrice = parseFloat(selectedOption.price);
            basePrice += additionalPrice;
            unitPrice += additionalPrice / tier.quantity;
          }
        }
      });

      return { total: basePrice, unit: unitPrice, quantity: parseInt(tier.quantity || 1) };
    }

    return {
      total: parseFloat(product?.price || 0),
      unit: parseFloat(product?.price || 0),
      quantity: 1,
    };
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={i} className="text-yellow-400" />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++)
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
    return stars;
  };

  const previousImage = () =>
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  const nextImage = () =>
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));

  const handleImageError = (e) => {
    e.target.src = `https://via.placeholder.com/500x500/f3f4f6/9ca3af?text=${encodeURIComponent(
      product?.name || "Product"
    )}`;
  };

  const renderAttribute = (attrKey, attrValue) => {
    if (!Array.isArray(attrValue) || attrValue.length === 0) return null;

    const label = formatLabel(attrKey);
    const selectedValue = selectedAttributes[attrKey];

    if (attrKey === "delivery_speed" || attrKey === "delivery_options") {
      return (
        <div key={attrKey} className="mb-5">
          <h4 className="text-base font-semibold text-gray-900 mb-3">{label}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attrValue.map((option) => {
              const optionId = option.id || option.value;
              const optionName = option.name || option.label;
              const isSelected = selectedValue === optionId;

              return (
                <button
                  key={optionId}
                  onClick={() => handleAttributeChange(attrKey, optionId)}
                  className={`border-2 rounded-lg py-3 px-4 text-center font-medium transition ${isSelected
                      ? "border-black bg-white text-gray-900"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                >
                  {optionName}
                  {option.price > 0 && <span className="text-sm text-gray-600 block mt-1">+₹{option.price}</span>}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (attrKey === "color" && attrValue[0]?.value?.startsWith("#")) {
      return (
        <div key={attrKey} className="mb-5">
          <h4 className="text-base font-semibold text-gray-900 mb-3">{label}</h4>
          <div className="flex flex-wrap gap-3">
            {attrValue.map((option) => {
              const optionId = option.id || option.value;
              const isSelected = selectedValue === optionId;

              return (
                <button
                  key={optionId}
                  onClick={() => handleAttributeChange(attrKey, optionId)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${isSelected ? "border-blue-500 scale-110 shadow-lg" : "border-gray-300 hover:border-gray-400"
                    }`}
                  style={{ backgroundColor: option.value }}
                  title={option.name}
                >
                  {isSelected && (
                    <IoCheckmarkCircle
                      className={`w-full h-full ${option.value === "#FFFFFF" ? "text-blue-500" : "text-white"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div key={attrKey} className="mb-5">
        <label className="block text-base font-semibold text-gray-900 mb-2">{label}</label>
        <div className="relative">
          <select
            value={selectedValue || ""}
            onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 bg-white text-gray-900 font-medium appearance-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          >
            <option value="">Select...</option>
            {attrValue.map((option, index) => {
              const optionId = option.id || option.value || option.quantity || index;
              const optionName = option.name || option.label || option.quantity || optionId;
              let displayText = optionName;
              if (option.quantity && option.unitPrice) displayText = `${option.quantity} (₹${parseFloat(option.unitPrice).toFixed(2)} / unit)`;
              if (option.price > 0 && attrKey !== "quantity") displayText += ` (+₹${option.price})`;
              return (
                <option key={optionId} value={optionId}>
                  {displayText}
                </option>
              );
            })}
          </select>
          <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FaArrowLeft className="inline mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const selectedPrice = getSelectedPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition">
            <FaArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle size={20} />
              {success}
            </div>
            <button onClick={() => setSuccess("")}>
              <IoClose size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
            <div className="space-y-6">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  src={allImages[selectedImageIndex]?.url}
                  alt={allImages[selectedImageIndex]?.alt || product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={handleImageError}
                />
                {allImages.length > 1 && (
                  <>
                    <button onClick={previousImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <IoChevronBack size={20} />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <IoChevronForward size={20} />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
                <button onClick={toggleFavorite} className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-lg">
                  {isFavorite ? <FaHeart className="text-red-500" size={20} /> : <FaRegHeart className="text-gray-600" size={20} />}
                </button>
                {product.is_featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">⭐ Featured</div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === index ? "border-blue-500" : "border-gray-200"}`}
                    >
                      <img src={image.url} alt={image.alt} className="w-full h-full object-cover" onError={handleImageError} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {product.is_active ? "Available" : "Out of Stock"}
                  </span>
                </div>

                {product.rating > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">{renderStarRating(parseFloat(product.rating))}</div>
                    <span className="text-sm text-gray-600">{parseFloat(product.rating).toFixed(1)} ({product.reviews_count || 0} reviews)</span>
                  </div>
                )}

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">₹{selectedPrice.unit.toFixed(2)}</span>
                  <span className="text-gray-600">each / </span>
                  <span className="text-gray-600">{selectedPrice.quantity} {selectedPrice.quantity === 1 ? "unit" : "units"}</span>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-semibold underline">
                    Free shipping by {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} to 110001
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span>SKU:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{product.sku}</code>
                  </div>
                  {product.category && (
                    <div className="flex items-center gap-2">
                      <span>Category:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{product.category.name}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 ${parseInt(product.stock_quantity) > 0 ? "text-green-600" : "text-red-600"}`}>
                    <span>Stock:</span>
                    <span className="font-medium">{parseInt(product.stock_quantity) > 0 ? `${product.stock_quantity} units` : "Out of stock"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description || "No description available."}</p>
              </div>

              {(product.weight || product.dimensions) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {Object.keys(attributes).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customize Your {product.category?.name || "Product"}
                  </h3>

                  {Object.entries(attributes).map(([key, value]) => renderAttribute(key, value))}

                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-blue-100 mt-6">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedAttributes).map(([key, value]) => {
                        if (key === "quantity" || key === "pricing_tiers") return null;
                        const attr = attributes[key];
                        if (!attr) return null;
                        const option = attr.find((opt) => (opt.id || opt.value) === value);
                        if (!option) return null;
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{formatLabel(key)}:</span>
                            <span className="font-medium">{option.name || value}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">Total</span>
                          <span className="text-2xl font-bold text-blue-600">₹{selectedPrice.total.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedPrice.quantity} units × ₹{selectedPrice.unit.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_active}
                  className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-semibold disabled:opacity-50"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    navigate(`/checkout?buyNow=true&productSlug=${product.slug}`);
                  }}
                  disabled={!product.is_active}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Free shipping on orders over ₹500 | 30-day return policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;
