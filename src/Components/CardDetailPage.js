import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { IoChevronDown, IoCheckmarkCircle, IoClose, IoChevronBack, IoChevronForward, IoCartOutline, IoFlash } from "react-icons/io5";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";
import RelatedProducts from "./RelatedProducts";
import DesignUpload from "./DesignUpload";
import QuantityPricingSelector from "./QuantityPricingSelector";
import ProductOptionsPanel from "./ProductOptionsPanel";
import FlipCardPreview from "./FlipCardPreview";
import OrderConfirmationSection from "./OrderConfirmationSection";

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
  const { slug, category } = useParams();
  const navigate = useNavigate();
  const { isFavorite: isFavoritedGlobal, toggleFavorite: toggleFavoriteGlobal } = useFavorites();
  const designUploadRef = useRef(null);

  // Product State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  // Image State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [cart, setCart] = useState([]);

  // Product Configuration State
  const [attributes, setAttributes] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [customDesigns, setCustomDesigns] = useState({ front: null, back: null });

  // UI Flow State
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [optionsCompleted, setOptionsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation State
  const [confirmDesign, setConfirmDesign] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
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

            // Start with mandatory orientation default
            const defaults = {
              orientation: "horizontal" // Mandatory default - card orientation
            };

            // Add defaults from database attributes
            Object.entries(productData.attributes).forEach(([key, value]) => {
              // Skip orientation-related keys from DB (we handle it separately)
              const normalizedKey = key.toLowerCase().replace(/[_\s]/g, "");
              if (normalizedKey === "orientation" || normalizedKey === "productorientation") {
                return;
              }

              if (Array.isArray(value) && value.length > 0) {
                const firstOption = value[0];
                // Handle various attribute option formats
                defaults[key] = firstOption.id || firstOption.value || firstOption.name || firstOption.quantity || firstOption;
              }
            });
            setSelectedAttributes(defaults);
          } else {
            // Even if no attributes, set default orientation
            setSelectedAttributes({ orientation: "horizontal" });
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

  // Load cart and check user
  useEffect(() => {
    const savedCart = localStorage.getItem("ecommerce_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

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

  const isFavorite = product ? isFavoritedGlobal(product.id) : false;
  const hasAllDesigns = customDesigns.front !== null && customDesigns.back !== null;
  const canOrder = confirmDesign && confirmTerms && hasAllDesigns && optionsCompleted;

  // Scroll to design upload section
  const scrollToDesignUpload = () => {
    designUploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Handle Add to Cart with FormData
  const handleAddToCart = async () => {
    if (!product || !canOrder) return;

    setIsSubmitting(true);
    try {
      const selectedPrice = getSelectedPrice();
      await api.get("/sanctum/csrf-cookie");

      // First, add to cart without files
      const cartPayload = {
        product_id: product.id,
        quantity: selectedPrice.quantity,
        selected_attributes: selectedAttributes,
      };

      const response = await api.post("/api/cart/add", cartPayload);

      if (response.data?.success) {
        const cartId = response.data.data?.id;

        // If we have designs and cart ID, upload them
        if (cartId && (customDesigns.front || customDesigns.back)) {
          const formData = new FormData();
          if (customDesigns.front?.file) {
            formData.append("front_design", customDesigns.front.file);
          }
          if (customDesigns.back?.file) {
            formData.append("back_design", customDesigns.back.file);
          }

          await api.post(`/api/cart/${cartId}/upload-designs`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }

        setSuccess("Product added to cart successfully!");
        setTimeout(() => setSuccess(""), 3000);

        // Update local cart
        const cartItem = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category?.name,
          price: selectedPrice.total,
          unitPrice: selectedPrice.unit,
          quantity: selectedPrice.quantity,
          selectedAttributes: selectedAttributes,
          hasCustomDesigns: hasAllDesigns,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    if (!product || !canOrder) return;

    setIsSubmitting(true);
    try {
      // First add to cart
      await handleAddToCart();

      // Navigate to checkout
      navigate(`/checkout?buyNow=true&productSlug=${product.slug}`);
    } catch (err) {
      setError("Failed to process. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Please login to add products to favorites"
        }
      });
      return;
    }

    if (!product) return;

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

  const handleOptionsProceed = () => {
    setShowOptionsPanel(false);
    setOptionsCompleted(true);
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

  if (error && !product) {
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
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition">
            <FaArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className={`${success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"} border px-4 py-3 rounded-lg flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle size={20} />
              {success || error}
            </div>
            <button onClick={() => { setSuccess(""); setError(""); }}>
              <IoClose size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Product Images & Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                    <img
                      src={allImages[selectedImageIndex]?.url}
                      alt={allImages[selectedImageIndex]?.alt || product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button onClick={previousImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition">
                          <IoChevronBack size={18} />
                        </button>
                        <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition">
                          <IoChevronForward size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={toggleFavorite} className="absolute top-3 right-3 p-2.5 bg-white/90 rounded-full shadow-md">
                      {isFavorite ? <FaHeart className="text-red-500" size={18} /> : <FaRegHeart className="text-gray-600" size={18} />}
                    </button>
                    {product.is_featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">Featured</div>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === index ? "border-blue-500" : "border-gray-200"}`}
                        >
                          <img src={image.url} alt={image.alt} className="w-full h-full object-cover" onError={handleImageError} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                    {product.rating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">{renderStarRating(parseFloat(product.rating))}</div>
                        <span className="text-sm text-gray-500">{parseFloat(product.rating).toFixed(1)} ({product.reviews_count || 0})</span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-gray-900">₹{selectedPrice.unit.toFixed(2)}</span>
                      <span className="text-gray-500">/card</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {product.short_description || product.description?.substring(0, 150)}...
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${product.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.is_active ? "In Stock" : "Out of Stock"}
                      </span>
                      {product.category && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Select Options Button */}
                  <button
                    onClick={() => setShowOptionsPanel(true)}
                    className={`
                      w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
                      ${optionsCompleted
                        ? "bg-green-50 border-2 border-green-500 text-green-700"
                        : "bg-cyan-400 hover:bg-cyan-500 text-black"
                      }
                    `}
                  >
                    {optionsCompleted ? (
                      <>
                        <IoCheckmarkCircle size={22} />
                        Options Selected - Click to Modify
                      </>
                    ) : (
                      <>
                        <IoFlash size={20} />
                        Select Options & Quantity
                      </>
                    )}
                  </button>

                  {/* Selected Options Summary */}
                  {optionsCompleted && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">Selected Options:</h4>
                      {Object.entries(selectedAttributes).map(([key, value]) => {
                        if (key === "quantity" || key === "pricing_tiers") {
                          return (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium">{value} cards</span>
                            </div>
                          );
                        }
                        const attr = attributes[key];
                        if (!attr) return null;
                        const option = attr.find((opt) => String(opt.id || opt.value) === String(value));
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{formatLabel(key)}:</span>
                            <span className="font-medium">{option?.name || value}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2 mt-2 flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-blue-600">₹{selectedPrice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Design Upload Section */}
              <div ref={designUploadRef} className="border-t p-6 lg:p-8">
                <DesignUpload
                  onDesignsChange={setCustomDesigns}
                  frontDesign={customDesigns.front}
                  backDesign={customDesigns.back}
                  showBackDesign={true}
                />
              </div>

              {/* Flip Card Preview Section */}
              {(customDesigns.front || customDesigns.back) && (
                <div className="border-t p-6 lg:p-8 bg-gray-50">
                  <FlipCardPreview
                    frontDesign={customDesigns.front}
                    backDesign={customDesigns.back}
                    productName={product.name}
                    orientation={selectedAttributes.orientation || "horizontal"}
                    onEditFront={scrollToDesignUpload}
                    onEditBack={scrollToDesignUpload}
                  />
                </div>
              )}
            </div>

            {/* Description & Specs */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 lg:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{product.description || "No description available."}</p>

              {(product.weight || product.dimensions) && (
                <div className="grid grid-cols-2 gap-4">
                  {product.weight && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-gray-500 text-sm">Weight</span>
                      <p className="font-semibold">{product.weight} kg</p>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-gray-500 text-sm">Dimensions</span>
                      <p className="font-semibold">{product.dimensions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Confirmation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderConfirmationSection
                confirmDesign={confirmDesign}
                confirmTerms={confirmTerms}
                onConfirmDesignChange={setConfirmDesign}
                onConfirmTermsChange={setConfirmTerms}
                hasAllDesigns={hasAllDesigns}
                selectedPrice={selectedPrice}
                selectedAttributes={selectedAttributes}
                formatLabel={formatLabel}
              />

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!canOrder || isSubmitting || !product.is_active}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
                    ${canOrder && product.is_active
                      ? "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <IoCartOutline size={22} />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!canOrder || isSubmitting || !product.is_active}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
                    ${canOrder && product.is_active
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <IoFlash size={20} />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Free shipping on orders over ₹500 | 30-day return policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        productSlug={slug}
        category={category}
        limit={8}
        title="Related Products"
        showViewAll={true}
      />

      {/* Product Options Panel (Sidebar) */}
      <ProductOptionsPanel
        isOpen={showOptionsPanel}
        onClose={() => setShowOptionsPanel(false)}
        product={product}
        attributes={attributes}
        selectedAttributes={selectedAttributes}
        onAttributeChange={handleAttributeChange}
        onProceed={handleOptionsProceed}
        selectedPrice={selectedPrice}
      />
    </div>
  );
};

export default CardDetailPage;
