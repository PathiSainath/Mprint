import React, { useState, useEffect } from 'react';
import {
  IoReceiptOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefresh,
  IoEyeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoChevronDown,
  IoChevronUp
} from 'react-icons/io5';
import api from '../../api/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/api/admin/orders', { params });

      if (response.data.success) {
        setOrders(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await api.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        setSuccess('Order status updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <IoReceiptOutline className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders Booked</h2>
            <p className="text-sm text-gray-600">Manage customer orders</p>
          </div>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <IoRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <IoCheckmarkCircle className="text-green-500 w-5 h-5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <IoCloseCircle className="text-red-500 w-5 h-5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <IoFilterOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <IoReceiptOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {order.order_items?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> ₹{parseFloat(order.total).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {expandedOrder === order.id ? (
                    <IoChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Name:</span> {order.user?.name}</p>
                        <p><span className="font-medium">Email:</span> {order.user?.email}</p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                        <p>{order.shipping_country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white rounded p-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Method:</p>
                        <p>{order.payment_method}</p>
                      </div>
                      <div>
                        <p className="font-medium">Transaction ID:</p>
                        <p className="font-mono text-xs">{order.transaction_id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Invoice ID:</p>
                        <p className="font-mono text-xs">{order.invoice_id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Payment Status:</p>
                        <p>{order.payment_status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Update Status</h4>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={updatingStatus === order.id || order.status === status}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            order.status === status
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatus === order.id ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
