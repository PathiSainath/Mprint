import React, { useState, useEffect } from 'react';
import {
  IoAlertCircleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefresh,
  IoImageOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoChevronDown,
  IoChevronUp,
  IoEyeOutline
} from 'react-icons/io5';
import api from '../../api/api';

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [viewingImages, setViewingImages] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/api/admin/complaints', { params });

      if (response.data.success) {
        setComplaints(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus, response) => {
    setUpdatingStatus(complaintId);
    try {
      const payload = { status: newStatus };
      if (response) {
        payload.admin_response = response;
      }

      const res = await api.put(
        `/api/admin/complaints/${complaintId}/status`,
        payload
      );

      if (res.data.success) {
        setSuccess('Complaint status updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        setAdminResponse('');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Failed to update complaint status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.order?.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.issue_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getIssuePriorityColor = (issueType) => {
    const priorities = {
      'Product Damaged': 'text-red-600',
      'Wrong Product Received': 'text-red-600',
      'Quality Issue': 'text-orange-600',
      'Missing Items': 'text-red-600',
      'Printing Error': 'text-orange-600',
      'Late Delivery': 'text-yellow-600',
      'Other': 'text-gray-600',
    };

    return priorities[issueType] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <IoAlertCircleOutline className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Issues Raised</h2>
            <p className="text-sm text-gray-600">Handle customer complaints</p>
          </div>
        </div>
        <button
          onClick={fetchComplaints}
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
              placeholder="Search by product, order, customer, issue type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <IoFilterOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Complaints</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {viewingImages && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setViewingImages(null)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Complaint Images</h3>
              <button onClick={() => setViewingImages(null)} className="text-gray-500 hover:text-gray-700">
                <IoCloseCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingImages.map((imagePath, index) => (
                <img
                  key={index}
                  src={`${API_BASE_URL}/storage/${imagePath}`}
                  alt={`Complaint evidence ${index + 1}`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <IoAlertCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Complaint Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedComplaint(expandedComplaint === complaint.id ? null : complaint.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">Complaint #{complaint.id}</h3>
                      {getStatusBadge(complaint.status)}
                      <span className={`text-sm font-medium ${getIssuePriorityColor(complaint.issue_type)}`}>
                        {complaint.issue_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Product:</span> {complaint.product_name}
                      </div>
                      <div>
                        <span className="font-medium">Order:</span> #{complaint.order?.order_number || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span> {complaint.user?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {expandedComplaint === complaint.id ? (
                    <IoChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Complaint Details */}
              {expandedComplaint === complaint.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Complaint Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Complaint Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Issue Type:</span> {complaint.issue_type}</p>
                        <p><span className="font-medium">Description:</span></p>
                        <p className="bg-white rounded p-3 border border-gray-200">{complaint.description}</p>
                        {complaint.images && complaint.images.length > 0 && (
                          <button
                            onClick={() => setViewingImages(complaint.images)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <IoImageOutline className="w-4 h-4" />
                            View {complaint.images.length} Image(s)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order & Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Order #:</span> {complaint.order?.order_number}</p>
                        <p><span className="font-medium">Product:</span> {complaint.product_name}</p>
                        <p><span className="font-medium">Customer:</span> {complaint.user?.name}</p>
                        <p><span className="font-medium">Email:</span> {complaint.user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {complaint.admin_response && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Response</h4>
                      <p className="bg-blue-50 rounded p-3 border border-blue-200 text-sm text-gray-700">
                        {complaint.admin_response}
                      </p>
                    </div>
                  )}

                  {/* Add/Update Response */}
                  {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Add Response</h4>
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Enter admin response..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                  )}

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Update Status</h4>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'in_review', 'resolved', 'rejected'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateComplaintStatus(complaint.id, status, adminResponse || complaint.admin_response)}
                          disabled={updatingStatus === complaint.id || complaint.status === status}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            complaint.status === status
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatus === complaint.id ? 'Updating...' : status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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

export default ComplaintsManagement;
