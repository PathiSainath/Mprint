import React, { useState, useEffect } from 'react';
import { applyAttributeTemplate, hasTemplate } from './productAttributes';
import BannerManagement from './BannerManagement';
import OfferBarManagement from './OfferBarManagement';
import OrdersManagement from './OrdersManagement';
import ComplaintsManagement from './ComplaintsManagement';
import {
  IoAdd,
  IoClose,
  IoTrash,
  IoSave,
  IoPencil,
  IoRefresh,
  IoHome,
  IoGridOutline,
  IoAppsOutline,
  IoStatsChartOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoStar,
  IoCloudUpload,
  IoChevronDown,
  IoColorPalette,
  IoRadioButtonOn,
  IoSearchOutline,
  IoFilterOutline,
  IoEyeOutline,
  IoSparkles,
  IoImageOutline,
  IoMegaphoneOutline,
  IoMenu,
  IoLogOutOutline,
  IoChevronForward,
  IoReceiptOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

const AdminPanel = () => {
  // State Management
  const [currentSection, setCurrentSection] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Image upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Attribute Builder States
  const [showAttributeBuilder, setShowAttributeBuilder] = useState(false);
  const [currentAttributeType, setCurrentAttributeType] = useState('delivery_speed');
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [newOption, setNewOption] = useState({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });

  // API Base URL
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Product Form State
  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    weight: '',
    dimensions: '',
    attributes: {},
    is_featured: false,
    is_active: true,
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    path: '',
    description: '',
    sort_order: '',
    is_active: true,
    is_featured: false,
  });

  // Sidebar menu items
  const menuItems = [
    {
      id: 'products',
      label: 'Products',
      icon: IoAppsOutline,
      description: 'Manage products',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: IoGridOutline,
      description: 'Organize catalog',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: IoImageOutline,
      description: 'Hero & promo banners',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'offers',
      label: 'Offer Bars',
      icon: IoMegaphoneOutline,
      description: 'Top notifications',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'orders',
      label: 'Orders Booked',
      icon: IoReceiptOutline,
      description: 'Manage orders',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'complaints',
      label: 'Issues Raised',
      icon: IoAlertCircleOutline,
      description: 'Handle complaints',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: IoStatsChartOutline,
      description: 'View insights',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  // Attribute Type Templates
  const attributeTypes = {
    delivery_speed: {
      label: 'Delivery Speed',
      type: 'radio',
      fields: ['id', 'name', 'price']
    },
    product_orientation: {
      label: 'Product Orientation',
      type: 'select',
      fields: ['id', 'name', 'price']
    },
    shape: {
      label: 'Shape',
      type: 'select',
      fields: ['id', 'name', 'price']
    },
    size: {
      label: 'Size',
      type: 'select',
      fields: ['id', 'name', 'price']
    },
    material: {
      label: 'Material',
      type: 'select',
      fields: ['id', 'name', 'price']
    },
    finish: {
      label: 'Finish',
      type: 'select',
      fields: ['id', 'name', 'price']
    },
    color: {
      label: 'Color',
      type: 'color',
      fields: ['id', 'name', 'value', 'price']
    },
    quantity: {
      label: 'Quantity / Pricing Tiers',
      type: 'quantity',
      fields: ['quantity', 'price', 'unitPrice']
    },
    custom: {
      label: 'Custom Attribute',
      type: 'select',
      fields: ['id', 'name', 'price']
    }
  };

  // Slug generation helper
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle Adding Attribute Option
  const handleAddAttributeOption = () => {
    const requiredFields = attributeTypes[currentAttributeType].fields;
    const errors = [];
    const isQuantityType = currentAttributeType === 'quantity';

    requiredFields.forEach(field => {
      // For quantity type, check numeric fields differently
      if (isQuantityType) {
        if (field === 'quantity') {
          const qty = parseFloat(newOption[field]);
          if (isNaN(qty) || qty <= 0) {
            errors.push('Quantity must be greater than 0');
          }
        } else if (field === 'price') {
          const price = parseFloat(newOption[field]);
          if (isNaN(price) || price < 0) {
            errors.push('Price is required and must be 0 or greater');
          }
        } else if (field === 'unitPrice') {
          const unitPrice = parseFloat(newOption[field]);
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push('Unit Price is required and must be 0 or greater');
          }
        }
      } else {
        // For non-quantity types
        if (field === 'price') {
          if (newOption[field] === '' || newOption[field] === undefined) {
            errors.push(`${field} is required`);
          }
        } else if (field === 'value') {
          // Color value is optional for some attributes
        } else if (!newOption[field] || String(newOption[field]).trim() === '') {
          errors.push(`${field} is required`);
        }
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(''), 3000);
      return;
    }

    const optionData = {};
    requiredFields.forEach(field => {
      if (field === 'price' || field === 'quantity' || field === 'unitPrice') {
        optionData[field] = parseFloat(newOption[field]) || 0;
      } else if (newOption[field]) {
        optionData[field] = String(newOption[field]).trim();
      }
    });

    setAttributeOptions([...attributeOptions, optionData]);
    setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
  };

  // Save Attribute to Product
  const handleSaveAttribute = () => {
    if (attributeOptions.length === 0) {
      setError('Please add at least one option for this attribute');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setProductForm(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [currentAttributeType]: attributeOptions
      }
    }));

    setShowAttributeBuilder(false);
    setAttributeOptions([]);
    setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
    setSuccess(`${attributeTypes[currentAttributeType].label} attribute added successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Edit Existing Attribute
  const handleEditAttribute = (attrKey) => {
    setCurrentAttributeType(attrKey);
    setAttributeOptions(productForm.attributes[attrKey] || []);
    setShowAttributeBuilder(true);
  };

  // Delete Attribute
  const handleDeleteAttribute = (attrKey) => {
    if (!window.confirm(`Are you sure you want to delete "${attributeTypes[attrKey]?.label}" attribute?`)) {
      return;
    }

    setProductForm(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[attrKey];
      return { ...prev, attributes: newAttributes };
    });

    setSuccess('Attribute deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Remove Option from List
  const handleRemoveOption = (index) => {
    setAttributeOptions(attributeOptions.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    setImagePreviews([]);
    setImageFiles([]);

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        errors.push(`File ${file.name}: Only JPEG, JPG, PNG, WEBP, and GIF allowed.`);
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        errors.push(`File ${file.name}: Max size 20MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 10) {
      errors.push('You can upload a maximum of 10 images.');
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles(validFiles);
    setImagePreviews(previews);
  };

  const removeImagePreview = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError(`Failed to fetch categories: ${err.message}`);
      console.error('Fetch error:', err);
      setCategories([]);
    }

    setLoading(false);
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.data) {
        setProducts(data.data.data);
      } else if (data.success && data.data) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
      console.error('Fetch error:', err);
      setProducts([]);
    }

    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Handle Product Form Changes
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    setProductForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && value.trim()) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle Category Form Changes
  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    setCategoryForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && value.trim()) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Submit Product Form
  const submitProductForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadingImages(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      if (!productForm.name.trim()) {
        throw new Error('Product name is required.');
      }
      if (!productForm.category_id) {
        throw new Error('Please select a category.');
      }
      if (!productForm.price || parseFloat(productForm.price) <= 0) {
        throw new Error('Please enter a valid price.');
      }
      if (!productForm.description.trim()) {
        throw new Error('Product description is required.');
      }
      if (!productForm.stock_quantity || parseInt(productForm.stock_quantity) < 0) {
        throw new Error('Please enter a valid stock quantity.');
      }

      const price = parseFloat(productForm.price) || 0;
      const salePrice = productForm.sale_price ? parseFloat(productForm.sale_price) : null;

      if (salePrice && salePrice >= price) {
        throw new Error('Sale price must be less than the regular price.');
      }

      const formData = new FormData();
      formData.append('category_id', productForm.category_id);
      formData.append('name', productForm.name.trim());
      formData.append('slug', productForm.slug || generateSlug(productForm.name));
      formData.append('description', productForm.description.trim());
      formData.append('short_description', productForm.short_description.trim() || productForm.description.substring(0, 150));
      formData.append('price', price.toString());

      if (salePrice) {
        formData.append('sale_price', salePrice.toString());
      }

      formData.append('sku', productForm.sku.trim());
      formData.append('stock_quantity', parseInt(productForm.stock_quantity) || 0);

      if (productForm.weight) {
        formData.append('weight', parseFloat(productForm.weight));
      }
      if (productForm.dimensions) {
        formData.append('dimensions', productForm.dimensions.trim());
      }

      formData.append('is_featured', productForm.is_featured ? '1' : '0');
      formData.append('is_active', productForm.is_active ? '1' : '0');

      formData.append('attributes', JSON.stringify(productForm.attributes));

      imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      if (editingItem) {
        formData.append('_method', 'PUT');
      }

      const url = editingItem
        ? `${API_BASE_URL}/products/${editingItem.id}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 422) {
        if (data.errors) {
          setValidationErrors(data.errors);
          const errorMessages = [];
          Object.keys(data.errors).forEach(field => {
            if (Array.isArray(data.errors[field])) {
              errorMessages.push(...data.errors[field]);
            } else {
              errorMessages.push(data.errors[field]);
            }
          });
          setError(`Validation failed: ${errorMessages.join(', ')}`);
        } else {
          setError(data.message || 'Validation failed. Please check your input data.');
        }
      } else if (!response.ok) {
        const errorMsg = data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      } else if (data.success) {
        const successMessage = editingItem
          ? 'Product updated successfully!'
          : 'Product created successfully!';
        resetForm();
        setSuccess(successMessage);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // Submit Category Form
  const submitCategoryForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      const url = editingItem
        ? `${API_BASE_URL}/categories/${editingItem.id}`
        : `${API_BASE_URL}/categories`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = {
        ...categoryForm,
        slug: categoryForm.slug || generateSlug(categoryForm.name),
        sort_order: parseInt(categoryForm.sort_order) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 422) {
        if (data.errors) {
          setValidationErrors(data.errors);
          setError('Please fix the validation errors below');
        } else {
          setError(`Validation error: ${data.message || 'Please check your input data'}`);
        }
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`);
      } else {
        const successMessage = editingItem
          ? 'Category updated successfully!'
          : 'Category created successfully!';
        resetForm();
        setSuccess(successMessage);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(`Error saving category: ${err.message}`);
      console.error('Submit error:', err);
    }

    setLoading(false);
  };

  // Reset Form
  const resetForm = () => {
    setProductForm({
      category_id: '',
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: '',
      sale_price: '',
      sku: '',
      stock_quantity: '',
      weight: '',
      dimensions: '',
      attributes: {},
      is_featured: false,
      is_active: true,
    });

    setCategoryForm({
      name: '',
      slug: '',
      path: '',
      description: '',
      sort_order: '',
      is_active: true,
      is_featured: false,
    });

    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(false);
    setEditingItem(null);
    setValidationErrors({});
    setError('');
    setShowAttributeBuilder(false);
    setAttributeOptions([]);
    setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
  };

  // Edit Product
  const handleEditProduct = (product) => {
    setEditingItem(product);
    setCurrentSection('products');
    setProductForm({
      category_id: product.category_id || '',
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      sku: product.sku || '',
      stock_quantity: product.stock_quantity || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      attributes: product.attributes || {},
      is_featured: product.is_featured || false,
      is_active: product.is_active !== undefined ? product.is_active : true,
    });

    setImageFiles([]);
    setImagePreviews([]);
    setValidationErrors({});
    setShowForm(true);
  };

  // Edit Category
  const handleEditCategory = (category) => {
    setEditingItem(category);
    setCurrentSection('categories');
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      path: category.path || '',
      description: category.description || '',
      sort_order: category.sort_order || '',
      is_active: category.is_active !== undefined ? category.is_active : true,
      is_featured: category.is_featured || false,
    });
    setValidationErrors({});
    setShowForm(true);
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      setSuccess('Product deleted successfully!');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Error deleting product: ${err.message}`);
    }

    setLoading(false);
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      setSuccess('Category deleted successfully!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Error deleting category: ${err.message}`);
    }

    setLoading(false);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === parseInt(categoryId));
    return category ? category.name : 'Uncategorized';
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <IoSparkles size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs text-gray-400">Manage your store</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mx-auto">
                <IoSparkles size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full group relative ${
                    sidebarOpen ? 'px-4 py-3.5' : 'px-3 py-3.5'
                  } rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 shadow-lg'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg`
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.description}</div>
                      </div>
                    )}
                    {sidebarOpen && isActive && (
                      <IoChevronForward className="text-gray-400" size={16} />
                    )}
                  </div>
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.color}`} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700/50">
          {sidebarOpen ? (
            <div className="space-y-3">
              <a
                href="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <IoHome size={20} />
                <span className="text-sm font-medium">View Website</span>
              </a>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm"
              >
                <IoMenu size={18} className="mr-2" />
                Collapse
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <IoMenu size={20} />
              </button>
              <a
                href="/"
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <IoHome size={20} />
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === currentSection)?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {menuItems.find(item => item.id === currentSection)?.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchCategories();
                fetchProducts();
              }}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <IoRefresh
                size={20}
                className={`text-gray-700 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </header>

        {/* Content Area with Scroll */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 animate-in slide-in-from-top duration-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center shadow-sm">
                <IoCheckmarkCircle className="mr-3 text-green-600 flex-shrink-0" size={22} />
                <div className="flex-1 text-green-800 font-medium">{success}</div>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-2 p-1.5 hover:bg-green-100 rounded-lg transition"
                >
                  <IoClose size={18} className="text-green-600" />
                </button>
              </div>
            </div>
          )}

          {error && !showForm && (
            <div className="mb-6 animate-in slide-in-from-top duration-300">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl px-5 py-4">
                <div className="flex items-start">
                  <IoCloseCircle className="mr-3 mt-0.5 text-red-600 flex-shrink-0" size={22} />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm mt-1 text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="ml-2 p-1.5 hover:bg-red-100 rounded-lg transition"
                  >
                    <IoClose size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Content Based on Selected Section */}
          {currentSection === 'banners' && <BannerManagement />}
          {currentSection === 'offers' && <OfferBarManagement />}
          {currentSection === 'orders' && <OrdersManagement />}
          {currentSection === 'complaints' && <ComplaintsManagement />}

          {/* Products Section */}
          {currentSection === 'products' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h2>
                    <p className="text-gray-600">Manage your product catalog and inventory</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setCurrentSection('products');
                        setEditingItem(null);
                        setShowForm(true);
                      }}
                      className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <IoAdd size={20} className="group-hover:rotate-90 transition-transform" />
                      Add Product
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid/Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
                {loading && !showForm ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 && !error ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                      <IoAppsOutline size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">No products found</p>
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'Try a different search term' : 'Click "Add Product" to create your first product'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200/50 bg-gray-50/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attributes</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="group hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-200">
                                  <img
                                    className="w-full h-full object-cover"
                                    src={product.featured_image_url || product.featured_image || 'https://via.placeholder.com/56?text=No+Image'}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/56?text=No+Image';
                                    }}
                                  />
                                </div>
                                <div className="ml-4 min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1">
                                    {product.name}
                                    {product.is_featured && (
                                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                                        <IoStar className="mr-1" size={12} />
                                        Featured
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">SKU: {product.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                                {getCategoryName(product.category_id)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">₹{parseFloat(product.price || 0).toFixed(2)}</div>
                              {product.sale_price && (
                                <div className="text-xs text-red-600 font-semibold">Sale: ₹{parseFloat(product.sale_price).toFixed(2)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${
                                parseInt(product.stock_quantity) > 0
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                              }`}>
                                {product.stock_quantity || 0} units
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.attributes && Object.keys(product.attributes).length > 0 ? (
                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                                  {Object.keys(product.attributes).length} attrs
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${
                                product.is_active
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <IoPencil size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <IoTrash size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {currentSection === 'categories' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h2>
                    <p className="text-gray-600">Organize your products into categories</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setCurrentSection('categories');
                        setEditingItem(null);
                        setShowForm(true);
                      }}
                      className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <IoAdd size={20} className="group-hover:rotate-90 transition-transform" />
                      Add Category
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
                {loading && !showForm ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading categories...</p>
                  </div>
                ) : filteredCategories.length === 0 && !error ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                      <IoGridOutline size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">No categories found</p>
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'Try a different search term' : 'Click "Add Category" to create your first category'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200/50 bg-gray-50/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Path</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {filteredCategories.map((category) => (
                          <tr key={category.id} className="group hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center ring-1 ring-blue-200">
                                  <IoGridOutline className="text-blue-600" size={20} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1">
                                    {category.name}
                                    {category.is_featured && (
                                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                                        <IoStar className="mr-1" size={12} />
                                        Featured
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{category.description || 'No description'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-600 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
                                {category.path}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                                {category.products?.length || 0} products
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{category.sort_order}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${
                                category.is_active
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <IoPencil size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <IoTrash size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {currentSection === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Analytics Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: IoAppsOutline, value: products.length, label: 'Total Products', color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
                    { icon: IoGridOutline, value: categories.length, label: 'Total Categories', color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50' },
                    { icon: IoStar, value: products.filter((p) => p.is_featured).length, label: 'Featured Products', color: 'from-yellow-500 to-orange-500', bg: 'from-yellow-50 to-orange-50' },
                    { icon: IoCheckmarkCircle, value: products.filter((p) => p.is_active).length, label: 'Active Products', color: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50' }
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-6 border border-gray-100 hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                          <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                        </div>
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                          <stat.icon className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-6">
                    <IoStatsChartOutline size={36} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    More Analytics Coming Soon
                  </h4>
                  <p className="text-gray-500">Advanced insights and reports will be available here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal - Enhanced Design */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem
                      ? currentSection === 'products' ? 'Edit Product' : 'Edit Category'
                      : currentSection === 'products' ? 'Add New Product' : 'Add New Category'
                    }
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                >
                  <IoClose size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 px-8 py-6">
              {error && showForm && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {/* Product Form */}
              {currentSection === 'products' && (
                <form onSubmit={submitProductForm} className="space-y-8" encType="multipart/form-data">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                        <select
                          name="category_id"
                          value={productForm.category_id}
                          onChange={handleProductChange}
                          required
                          className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                            validationErrors.category_id
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                          }`}
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {validationErrors.category_id && (
                          <p className="mt-2 text-sm text-red-600">
                            {Array.isArray(validationErrors.category_id)
                              ? validationErrors.category_id[0]
                              : validationErrors.category_id
                            }
                          </p>
                        )}
                      </div>

                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductChange}
                          required
                          placeholder="Enter product name"
                          className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                            validationErrors.name
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                          }`}
                        />
                        {validationErrors.name && (
                          <p className="mt-2 text-sm text-red-600">
                            {Array.isArray(validationErrors.name) ? validationErrors.name[0] : validationErrors.name}
                          </p>
                        )}
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          name="slug"
                          value={productForm.slug}
                          onChange={handleProductChange}
                          placeholder="auto-generated-slug"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">Leave empty to auto-generate from product name</p>
                      </div>

                      {/* Price & Sale Price */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="price"
                              value={productForm.price}
                              onChange={handleProductChange}
                              required
                              placeholder="0.00"
                              className={`w-full border rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                                validationErrors.price
                                  ? 'border-red-300 focus:ring-red-100'
                                  : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                              }`}
                            />
                          </div>
                          {validationErrors.price && (
                            <p className="mt-2 text-sm text-red-600">
                              {Array.isArray(validationErrors.price) ? validationErrors.price[0] : validationErrors.price}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="sale_price"
                              value={productForm.sale_price}
                              onChange={handleProductChange}
                              placeholder="Optional"
                              className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SKU & Stock */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                          <input
                            type="text"
                            name="sku"
                            value={productForm.sku}
                            onChange={handleProductChange}
                            placeholder="Auto-generated"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                          <input
                            type="number"
                            min="0"
                            name="stock_quantity"
                            value={productForm.stock_quantity}
                            onChange={handleProductChange}
                            required
                            placeholder="0"
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                              validationErrors.stock_quantity
                                ? 'border-red-300 focus:ring-red-100'
                                : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Weight & Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="weight"
                            value={productForm.weight}
                            onChange={handleProductChange}
                            placeholder="0.00"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions</label>
                          <input
                            type="text"
                            name="dimensions"
                            value={productForm.dimensions}
                            onChange={handleProductChange}
                            placeholder="10cm x 5cm x 2cm"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Product Attributes Section */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Product Attributes
                        </label>
                        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                <IoColorPalette className="text-purple-600" size={18} />
                              </div>
                              <span className="text-sm font-bold text-gray-900">Dynamic Attributes</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAttributeBuilder(true)}
                              className="group px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                            >
                              <IoAdd size={16} className="group-hover:rotate-90 transition-transform" />
                              Add Attribute
                            </button>
                          </div>

                          {Object.keys(productForm.attributes).length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm bg-white/50 rounded-xl">
                              No attributes added yet. Click "Add Attribute" to start.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {Object.entries(productForm.attributes).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {attributeTypes[key]?.type === 'radio' && (
                                      <div className="p-2 rounded-lg bg-purple-100">
                                        <IoRadioButtonOn className="text-purple-600" size={16} />
                                      </div>
                                    )}
                                    {attributeTypes[key]?.type === 'select' && (
                                      <div className="p-2 rounded-lg bg-blue-100">
                                        <IoChevronDown className="text-blue-600" size={16} />
                                      </div>
                                    )}
                                    {attributeTypes[key]?.type === 'color' && (
                                      <div className="p-2 rounded-lg bg-pink-100">
                                        <IoColorPalette className="text-pink-600" size={16} />
                                      </div>
                                    )}
                                    {attributeTypes[key]?.type === 'quantity' && (
                                      <div className="p-2 rounded-lg bg-green-100">
                                        <span className="text-green-600 font-bold text-sm">#</span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-gray-900 text-sm">
                                        {attributeTypes[key]?.label || key}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {Array.isArray(value) ? `${value.length} options configured` : 'Invalid format'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditAttribute(key)}
                                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                      title="Edit"
                                    >
                                      <IoPencil size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAttribute(key)}
                                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                      title="Delete"
                                    >
                                      <IoTrash size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 text-xs text-gray-600 bg-white/70 rounded-xl p-3 border border-blue-100">
                            <strong className="text-blue-700">Tip:</strong> Add attributes like delivery speed, shape, size, material, color, and quantity pricing tiers to enhance customer experience.
                          </div>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={productForm.is_featured}
                            onChange={handleProductChange}
                            className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Featured Product</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={productForm.is_active}
                            onChange={handleProductChange}
                            className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Active</span>
                        </label>
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Product Images</label>
                        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4 group-hover:scale-110 transition-transform">
                              <IoCloudUpload className="text-blue-600" size={32} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload images</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 20MB • Max 10 images</p>
                          </label>
                        </div>

                        {imagePreviews.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs">
                                {imagePreviews.length}
                              </span>
                              Selected Images
                            </p>
                            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                              {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeImagePreview(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                  >
                                    <IoClose size={14} />
                                  </button>
                                  {index === 0 && (
                                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-lg">
                                      Featured
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {uploadingImages && (
                          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center text-sm text-blue-700">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                              <span className="font-medium">Uploading images...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                          name="description"
                          value={productForm.description}
                          onChange={handleProductChange}
                          required
                          rows="6"
                          placeholder="Detailed product description..."
                          className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 resize-none transition-all ${
                            validationErrors.description
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                          }`}
                        />
                      </div>

                      {/* Short Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                        <textarea
                          name="short_description"
                          value={productForm.short_description}
                          onChange={handleProductChange}
                          rows="3"
                          placeholder="Brief summary for listings..."
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingImages}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <IoSave size={18} />
                          {loading ? 'Saving...' : editingItem ? 'Update Product' : 'Create Product'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Category Form */}
              {currentSection === 'categories' && (
                <form onSubmit={submitCategoryForm} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={categoryForm.name}
                        onChange={handleCategoryChange}
                        required
                        placeholder="Enter category name"
                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                          validationErrors.name
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Path *</label>
                      <input
                        type="text"
                        name="path"
                        value={categoryForm.path}
                        onChange={handleCategoryChange}
                        required
                        placeholder="/category-name"
                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all font-mono text-sm ${
                          validationErrors.path
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                      <input
                        type="number"
                        min="0"
                        name="sort_order"
                        value={categoryForm.sort_order}
                        onChange={handleCategoryChange}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={categoryForm.description}
                      onChange={handleCategoryChange}
                      rows="4"
                      placeholder="Category description..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={categoryForm.is_featured}
                        onChange={handleCategoryChange}
                        className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Featured Category</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={categoryForm.is_active}
                        onChange={handleCategoryChange}
                        className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Active</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <IoSave size={18} />
                      {loading ? 'Saving...' : editingItem ? 'Update Category' : 'Create Category'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attribute Builder Modal - Modern Card UI */}
      {showAttributeBuilder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex justify-between items-center">
                <div className="text-white">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <IoColorPalette size={24} />
                    </div>
                    Attribute Builder
                  </h3>
                  <p className="text-white/80 mt-1 text-sm">Create and customize product attributes</p>
                </div>
                <button
                  onClick={() => {
                    setShowAttributeBuilder(false);
                    setAttributeOptions([]);
                    setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
                  }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <IoClose size={22} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Attribute Type Cards */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Select Attribute Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Object.entries(attributeTypes).map(([key, config]) => {
                    const icons = {
                      delivery_speed: '🚚',
                      product_orientation: '🔄',
                      shape: '🔲',
                      size: '📐',
                      material: '📄',
                      finish: '✨',
                      color: '🎨',
                      quantity: '📦',
                      custom: '⚙️'
                    };
                    const isSelected = currentAttributeType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setCurrentAttributeType(key);
                          setAttributeOptions([]);
                          setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
                        }}
                        className={`
                          relative p-4 rounded-2xl border-2 transition-all duration-200 text-center group
                          ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20 scale-105'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{icons[key] || '📋'}</div>
                        <div className={`text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {config.label.split(' ')[0]}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <IoCheckmarkCircle className="text-white" size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Fill Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                    <span className="p-1.5 bg-amber-200 rounded-lg">⚡</span>
                    Quick Fill
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAttributeOptions([])}
                    className="px-3 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <IoTrash size={12} />
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentAttributeType === 'quantity' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { quantity: 100, price: 200, unitPrice: 2.00 },
                          { quantity: 200, price: 340, unitPrice: 1.70 },
                          { quantity: 300, price: 480, unitPrice: 1.60 },
                          { quantity: 400, price: 600, unitPrice: 1.50 },
                          { quantity: 500, price: 700, unitPrice: 1.40 },
                          { quantity: 1000, price: 1300, unitPrice: 1.30 },
                          { quantity: 1500, price: 1875, unitPrice: 1.25 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load 7 Pricing Tiers
                    </button>
                  )}
                  {currentAttributeType === 'product_orientation' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'horizontal', name: 'Horizontal', price: 0 },
                          { id: 'vertical', name: 'Vertical', price: 0 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Orientations
                    </button>
                  )}
                  {currentAttributeType === 'delivery_speed' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'standard', name: 'Standard Delivery', price: 0 },
                          { id: 'express', name: 'Express Delivery', price: 50 },
                          { id: 'same-day', name: 'Same Day Delivery', price: 100 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Delivery Options
                    </button>
                  )}
                  {currentAttributeType === 'shape' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'rectangle', name: 'Rectangle', price: 0 },
                          { id: 'square', name: 'Square', price: 10 },
                          { id: 'rounded', name: 'Rounded Corners', price: 15 },
                          { id: 'oval', name: 'Oval', price: 20 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Shapes
                    </button>
                  )}
                  {currentAttributeType === 'size' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'small', name: '5.08cm × 8.89cm (Standard)', price: 0 },
                          { id: 'medium', name: '7.62cm × 10.16cm (Medium)', price: 20 },
                          { id: 'large', name: '10cm × 15cm (Large)', price: 40 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Sizes
                    </button>
                  )}
                  {currentAttributeType === 'material' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'white-paper', name: 'White Paper', price: 0 },
                          { id: 'premium-paper', name: 'Premium Paper', price: 20 },
                          { id: 'plastic', name: 'Plastic', price: 40 },
                          { id: 'silver-foil', name: 'Silver Foil', price: 80 },
                          { id: 'gold-foil', name: 'Gold Foil', price: 100 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Materials
                    </button>
                  )}
                  {currentAttributeType === 'finish' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'matte', name: 'Matte Finish', price: 0 },
                          { id: 'glossy', name: 'Glossy Finish', price: 15 },
                          { id: 'satin', name: 'Satin Finish', price: 20 },
                          { id: 'uv-coating', name: 'UV Coating', price: 30 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Finishes
                    </button>
                  )}
                  {currentAttributeType === 'color' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttributeOptions([
                          { id: 'black', name: 'Black', value: '#000000', price: 0 },
                          { id: 'white', name: 'White', value: '#FFFFFF', price: 0 },
                          { id: 'red', name: 'Red', value: '#EF4444', price: 0 },
                          { id: 'blue', name: 'Blue', value: '#3B82F6', price: 0 },
                          { id: 'green', name: 'Green', value: '#22C55E', price: 0 }
                        ]);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Load Colors
                    </button>
                  )}
                  {currentAttributeType === 'custom' && (
                    <span className="text-sm text-amber-700 py-2">Enter custom options manually below</span>
                  )}
                </div>
              </div>

              {/* Add Option Form */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <IoAdd size={16} className="text-indigo-600" />
                  </div>
                  {currentAttributeType === 'quantity' ? 'Add Pricing Tier' : 'Add Option'}
                </h4>

                {currentAttributeType === 'quantity' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                          Quantity *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={newOption.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value) || 0;
                              const price = parseFloat(newOption.price) || 0;
                              setNewOption({
                                ...newOption,
                                quantity: e.target.value,
                                unitPrice: qty > 0 ? (price / qty).toFixed(2) : 0
                              });
                            }}
                            placeholder="100"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">units</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                          Total Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newOption.price}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              const qty = parseFloat(newOption.quantity) || 0;
                              setNewOption({
                                ...newOption,
                                price: e.target.value,
                                unitPrice: qty > 0 ? (price / qty).toFixed(2) : 0
                              });
                            }}
                            placeholder="200"
                            className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                          Unit Price <span className="text-gray-400 font-normal">(auto)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newOption.unitPrice}
                            onChange={(e) => setNewOption({ ...newOption, unitPrice: e.target.value })}
                            placeholder="2.00"
                            className="w-full border-2 border-green-200 bg-green-50 rounded-xl pl-8 pr-4 py-3 text-lg font-semibold text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm">/unit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attributeTypes[currentAttributeType].fields.map((field) => (
                      <div key={field} className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {field === 'id' ? 'ID' : field === 'value' ? 'Color Hex' : field} {field !== 'value' && '*'}
                        </label>
                        {field === 'value' ? (
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={newOption[field] || '#000000'}
                              onChange={(e) => setNewOption({ ...newOption, [field]: e.target.value })}
                              className="w-14 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={newOption[field]}
                              onChange={(e) => setNewOption({ ...newOption, [field]: e.target.value })}
                              placeholder="#000000"
                              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                            />
                          </div>
                        ) : (
                          <input
                            type={field === 'price' ? 'number' : 'text'}
                            step={field === 'price' ? '0.01' : undefined}
                            min={field === 'price' ? '0' : undefined}
                            value={newOption[field]}
                            onChange={(e) => setNewOption({ ...newOption, [field]: e.target.value })}
                            placeholder={
                              field === 'id' ? 'e.g., horizontal' :
                              field === 'name' ? 'e.g., Horizontal' :
                              field === 'price' ? '0.00' : ''
                            }
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddAttributeOption}
                  className="mt-5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <IoAdd size={20} />
                  {currentAttributeType === 'quantity' ? 'Add Pricing Tier' : 'Add Option'}
                </button>
              </div>

              {/* Options List */}
              {attributeOptions.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <IoCheckmarkCircle size={16} className="text-green-600" />
                      </div>
                      {currentAttributeType === 'quantity' ? 'Pricing Tiers' : 'Options'}
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        {attributeOptions.length}
                      </span>
                    </h4>
                  </div>

                  {currentAttributeType === 'quantity' ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Per Unit</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {attributeOptions.map((option, index) => (
                            <tr key={index} className="hover:bg-indigo-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-bold text-gray-900">{option.quantity}</span>
                                <span className="text-gray-400 text-sm ml-1">units</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-700">₹{parseFloat(option.price || 0).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-lg">
                                  ₹{parseFloat(option.unitPrice || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <IoTrash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : currentAttributeType === 'color' ? (
                    <div className="flex flex-wrap gap-3">
                      {attributeOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 hover:shadow-md transition-shadow group"
                        >
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                            style={{ backgroundColor: option.value || '#000000' }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{option.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{option.value}</div>
                          </div>
                          {option.price > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              +₹{option.price}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <IoClose size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {attributeOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{option.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400 font-mono">{option.id}</span>
                              {option.price > 0 && (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  +₹{option.price}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <IoTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {attributeOptions.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <IoCheckmarkCircle className="text-green-500" size={16} />
                    {attributeOptions.length} option{attributeOptions.length > 1 ? 's' : ''} configured
                  </span>
                ) : (
                  <span>Add at least one option to save</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttributeBuilder(false);
                    setAttributeOptions([]);
                    setNewOption({ id: '', name: '', price: 0, value: '', quantity: 0, unitPrice: 0 });
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttribute}
                  disabled={attributeOptions.length === 0}
                  className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    attributeOptions.length > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <IoSave size={18} />
                  Save Attribute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
