import React, { useState } from 'react';
import {
  FaTimes,
  FaExclamationTriangle,
  FaImage,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';
import api from '../api/api';

const RaiseTicketModal = ({ order, product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    issueType: '',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const issueTypes = [
    'Product Damaged',
    'Wrong Product Received',
    'Quality Issue',
    'Missing Items',
    'Printing Error',
    'Late Delivery',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 images
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Only JPG, JPEG, and PNG images are allowed');
        return false;
      }

      if (file.size > maxSize) {
        setError('Each image must be less than 5MB');
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setError('');
      setImages(prev => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.issueType) {
      setError('Please select an issue type');
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setError('Please provide a detailed description (minimum 10 characters)');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('order_id', order.id);
      submitData.append('product_id', product.product_id);
      submitData.append('issue_type', formData.issueType);
      submitData.append('description', formData.description.trim());

      // Append images
      images.forEach((image, index) => {
        submitData.append(`images[${index}]`, image);
      });

      const response = await api.post('/api/orders/raise-ticket', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Close modal immediately
        onSuccess();

        // Show toast notification (will be implemented in parent component)
        if (window.showToast) {
          window.showToast('Complaint submitted successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to submit complaint. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Raise a Complaint</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order & Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Order Number:</span> {order.order_number}</p>
              {order.transaction_id && (
                <p><span className="font-medium">Transaction ID:</span> {order.transaction_id}</p>
              )}
              {order.invoice_id && (
                <p><span className="font-medium">Invoice ID:</span> {order.invoice_id}</p>
              )}
              <p><span className="font-medium">Product:</span> {product.product_name}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Select an issue type</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please describe your issue in detail (minimum 10 characters)..."
                required
                disabled={loading}
                minLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Images (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload up to 5 images (JPG, PNG, max 5MB each)
              </p>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                        disabled={loading}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {images.length < 5 && (
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <FaImage className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {images.length === 0 ? 'Upload Images' : 'Upload More Images'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaiseTicketModal;
