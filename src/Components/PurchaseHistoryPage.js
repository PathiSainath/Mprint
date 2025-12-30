import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaReceipt,
  FaCalendar,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaExclamationTriangle,
  FaImage
} from 'react-icons/fa';
import api from '../api/api';
import RaiseTicketModal from './RaiseTicketModal';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, []);

  const checkAuthAndFetchOrders = async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const userRes = await api.get('/api/user');
      const userData = userRes.data?.user ?? userRes.data?.data ?? null;

      if (!userData) {
        navigate('/login');
      } else {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/orders');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load purchase history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseTicket = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setShowTicketModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="w-4 h-4" />,
      processing: <FaClock className="w-4 h-4" />,
      shipped: <FaTruck className="w-4 h-4" />,
      delivered: <FaCheckCircle className="w-4 h-4" />,
      cancelled: <FaTimes className="w-4 h-4" />
    };
    return icons[status] || <FaClock className="w-4 h-4" />;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      failed: 'text-red-600',
      refunded: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <FaCheckCircle className="text-xl" />
            <p className="font-medium">{successToast}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaBox className="text-blue-600" />
            Purchase History
          </h1>
          <p className="mt-2 text-gray-600">View your order history and manage complaints</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">You haven't made any purchases yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-gray-400" />
                          <span>{new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCreditCard className="text-gray-400" />
                          <span className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                        {order.tracking_number && (
                          <div className="flex items-center gap-2">
                            <FaTruck className="text-gray-400" />
                            <span>Tracking: {order.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${parseFloat(order.total).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.order_items?.length || 0} item(s)</p>
                    </div>
                  </div>

                  {/* Payment & Invoice Info */}
                  {(order.transaction_id || order.invoice_id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {order.transaction_id && (
                          <div className="flex items-center gap-2">
                            <FaReceipt className="text-gray-400" />
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-gray-900">{order.transaction_id}</span>
                          </div>
                        )}
                        {order.invoice_id && (
                          <div className="flex items-center gap-2">
                            <FaReceipt className="text-gray-400" />
                            <span className="text-gray-600">Invoice ID:</span>
                            <span className="font-mono text-gray-900">{order.invoice_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Order Items (Expandable) */}
                {expandedOrder === order.id && (
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {item.product?.images?.[0]?.image_path ? (
                                <img
                                  src={`${API_BASE_URL}/storage/${item.product.images[0].image_path}`}
                                  alt={item.product_name}
                                  className="w-24 h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <FaImage className="text-gray-400 text-2xl" />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 mb-1">{item.product_name}</h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                                <p className="font-semibold text-gray-900">
                                  Subtotal: ${parseFloat(item.subtotal).toFixed(2)}
                                </p>
                                {item.product_attributes && Object.keys(item.product_attributes).length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">Attributes:</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {Object.entries(item.product_attributes).map(([key, value]) => (
                                        <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                          {key}: {value}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Raise Ticket Button */}
                              <button
                                onClick={() => handleRaiseTicket(order, item)}
                                className="mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium flex items-center gap-2"
                              >
                                <FaExclamationTriangle />
                                Raise a Complaint
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 bg-white rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                        </div>
                        {order.tax > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Tax:</span>
                            <span>${parseFloat(order.tax).toFixed(2)}</span>
                          </div>
                        )}
                        {order.shipping > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping:</span>
                            <span>${parseFloat(order.shipping).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                          <span>Total:</span>
                          <span>${parseFloat(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showTicketModal && (
        <RaiseTicketModal
          order={selectedOrder}
          product={selectedProduct}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedOrder(null);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowTicketModal(false);
            setSelectedOrder(null);
            setSelectedProduct(null);
            setSuccessToast('Complaint submitted successfully!');
            setTimeout(() => setSuccessToast(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
