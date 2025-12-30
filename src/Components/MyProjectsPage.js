import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHeart,
  FaFolderOpen,
  FaBox,
  FaUndo,
  FaShoppingCart,
  FaTrash,
  FaEye,
  FaEdit,
  FaDownload,
  FaPlus,
  FaFilter,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTruck
} from 'react-icons/fa';
import { IoGridOutline, IoListOutline } from 'react-icons/io5';
import api from '../api/api';
import { useFavorites } from '../context/FavoritesContext';

const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, favoritesCount } = useFavorites();
  const [activeTab, setActiveTab] = useState('wishlist');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Tabs configuration
  const tabs = [
    { id: 'wishlist', label: 'Wishlist', icon: FaHeart, count: favoritesCount },
    { id: 'projects', label: 'My Projects', icon: FaFolderOpen, count: projects.length },
    { id: 'orders', label: 'My Orders', icon: FaBox, count: orders.length },
    { id: 'returns', label: 'Returns', icon: FaUndo, count: 0 }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'projects') fetchProjects();
      if (activeTab === 'orders') fetchOrders();
    }
  }, [activeTab, user]);

  const checkAuth = async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const userRes = await api.get('/api/user');
      const userData = userRes.data?.user ?? userRes.data?.data ?? null;
      if (!userData) {
        navigate('/login');
      } else {
        setUser(userData);
      }
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    // Placeholder - you can implement saved projects/designs functionality later
    setProjects([
      {
        id: 1,
        name: 'Business Card Design',
        thumbnail: 'https://via.placeholder.com/300x200?text=Business+Card',
        lastModified: '2 hours ago',
        status: 'draft'
      },
      {
        id: 2,
        name: 'Wedding Invitation',
        thumbnail: 'https://via.placeholder.com/300x200?text=Wedding+Invitation',
        lastModified: '1 day ago',
        status: 'completed'
      }
    ]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    // Placeholder - you can implement orders functionality later
    setOrders([
      {
        id: 1,
        orderNumber: 'ORD-2025-001',
        date: '2025-01-15',
        total: 1500,
        status: 'delivered',
        items: 2
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-002',
        date: '2025-01-20',
        total: 2500,
        status: 'processing',
        items: 3
      }
    ]);
    setLoading(false);
  };

  const handleRemoveFavorite = async (productId) => {
    if (!window.confirm('Remove this item from wishlist?')) return;

    const result = await removeFromFavorites(productId);
    if (result.success) {
      setSuccess('Product removed from wishlist');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message || 'Failed to remove from wishlist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddToCart = async (product) => {
    // Favorites are product objects directly
    const productData = product;
    setAddingToCart(prev => new Set([...prev, productData.id]));
    try {
      await api.get('/sanctum/csrf-cookie');
      const response = await api.post('/api/cart/add', {
        product_id: productData.id,
        quantity: 1
      });

      if (response.data?.success) {
        setSuccess(`${productData.name} added to cart!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productData.id);
        return newSet;
      });
    }
  };

  const handleViewProduct = (product) => {
    // Favorites are product objects directly
    const categorySlug = product.category?.slug || 'products';
    const productSlug = product.slug;
    if (productSlug) {
      navigate(`/${categorySlug}/${productSlug}`);
    }
  };

  const filteredFavorites = favorites.filter(fav =>
    // Favorites are product objects directly
    fav.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(proj =>
    proj.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage your wishlists, projects, and orders</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  title="Grid View"
                >
                  <IoGridOutline size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  title="List View"
                >
                  <IoListOutline size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 mb-4">
                      <FaHeart className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                    {filteredFavorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                          <div className="relative aspect-square bg-gray-100">
                            <img
                              src={favorite.featured_image_url || favorite.featured_image || 'https://via.placeholder.com/300?text=No+Image'}
                              alt={favorite.name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                              }}
                            />
                            <button
                              onClick={() => handleRemoveFavorite(favorite.id)}
                              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                              title="Remove from wishlist"
                            >
                              <FaHeart className="text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {favorite.name || 'Unnamed Product'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {favorite.category?.name || 'Uncategorized'}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                ₹{parseFloat(favorite.price || 0).toFixed(2)}
                              </span>
                              {favorite.sale_price && (
                                <span className="ml-2 text-sm text-red-600 font-semibold">
                                  Save ₹{(parseFloat(favorite.price) - parseFloat(favorite.sale_price)).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewProduct(favorite)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <FaEye size={14} />
                              View
                            </button>
                            <button
                              onClick={() => handleAddToCart(favorite)}
                              disabled={addingToCart.has(favorite.id)}
                              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                addingToCart.has(favorite.id)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <FaShoppingCart size={14} />
                              {addingToCart.has(favorite.id) ? 'Adding...' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                      <FaFolderOpen className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-6">Create and save your custom designs</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                    >
                      <FaPlus />
                      Create New Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
                      >
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              project.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status === 'completed' ? 'Completed' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <FaClock size={12} />
                            Modified {project.lastModified}
                          </p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                              <FaEdit size={12} />
                              Edit
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <FaDownload size={14} />
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 mb-4">
                      <FaBox className="text-orange-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Your order history will appear here</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'delivered' && <FaCheckCircle className="inline mr-1" size={12} />}
                                {order.status === 'processing' && <FaTruck className="inline mr-1" size={12} />}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span>Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span>{order.items} items</span>
                              <span className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                              <FaEye size={14} />
                              View Details
                            </button>
                            {order.status === 'delivered' && (
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                Buy Again
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Returns Tab */}
            {activeTab === 'returns' && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4">
                  <FaUndo className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No returns</h3>
                <p className="text-gray-500 mb-6">Your return requests will appear here</p>
                <p className="text-sm text-gray-400">Need to return an item? Contact customer support</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
