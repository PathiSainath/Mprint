import React, { useState } from 'react';
import { FaFilter, FaTimes, FaSort, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import { IoChevronDown, IoChevronUp, IoSparkles } from 'react-icons/io5';
import PriceRangeFilter from './PriceRangeFilter';

const FilterSidebar = ({
  priceRange = { min: 0, max: 10000 },
  selectedPriceRange = [0, 10000],
  sortBy = 'created_at',
  sortOrder = 'desc',
  onPriceChange,
  onSortChange,
  onClearFilters,
  totalProducts = 0,
  isMobile = false,
  isOpen = false,
  onClose = () => {}
}) => {
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);
  const [isSortExpanded, setIsSortExpanded] = useState(true);

  const sortOptions = [
    {
      value: 'created_at_desc',
      label: 'Newest First',
      icon: '🆕',
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    {
      value: 'price_asc',
      label: 'Price: Low to High',
      icon: '💰',
      sortBy: 'price',
      sortOrder: 'asc'
    },
    {
      value: 'price_desc',
      label: 'Price: High to Low',
      icon: '💎',
      sortBy: 'price',
      sortOrder: 'desc'
    },
    {
      value: 'name_asc',
      label: 'Name: A to Z',
      icon: '🔤',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    {
      value: 'name_desc',
      label: 'Name: Z to A',
      icon: '🔡',
      sortBy: 'name',
      sortOrder: 'desc'
    },
  ];

  const currentSortValue = `${sortBy}_${sortOrder}`;
  const isFiltered = selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max;

  const sidebarContent = (
    <div className="space-y-5">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-white opacity-10"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaFilter className="text-white" size={18} />
              </div>
              <h3 className="text-xl font-bold">Filters</h3>
            </div>
            {isFiltered && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all transform hover:scale-105"
              >
                <FaTimes size={10} />
                Clear All
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 mt-4">
            <IoSparkles className="text-yellow-300" size={20} />
            <p className="text-sm font-medium">
              <span className="text-2xl font-bold">{totalProducts}</span>
              <span className="ml-1 opacity-90">products found</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => setIsSortExpanded(!isSortExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaSort className="text-blue-600" size={16} />
            </div>
            <span className="font-semibold text-gray-900">Sort By</span>
          </div>
          <div className="flex items-center gap-2">
            {!isSortExpanded && (
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                {sortOptions.find(o => o.value === currentSortValue)?.label.split(':')[0]}
              </span>
            )}
            {isSortExpanded ? (
              <IoChevronUp className="text-gray-400" size={20} />
            ) : (
              <IoChevronDown className="text-gray-400" size={20} />
            )}
          </div>
        </button>

        <div className={`transition-all duration-300 ease-in-out ${isSortExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-3 space-y-1 bg-gray-50/50">
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                  currentSortValue === option.value
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-white hover:bg-blue-50 border border-gray-100'
                }`}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={currentSortValue === option.value}
                    onChange={() => onSortChange(option.sortBy, option.sortOrder)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    currentSortValue === option.value
                      ? 'border-white bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {currentSortValue === option.value && (
                      <FaCheckCircle className="text-blue-600" size={12} />
                    )}
                  </div>
                </div>
                <span className="text-xl">{option.icon}</span>
                <span className={`text-sm font-medium flex-1 ${
                  currentSortValue === option.value ? 'text-white' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaDollarSign className="text-green-600" size={16} />
            </div>
            <span className="font-semibold text-gray-900">Price Range</span>
            {isFiltered && (
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                <IoSparkles size={10} />
                Active
              </span>
            )}
          </div>
          {isPriceExpanded ? (
            <IoChevronUp className="text-gray-400" size={20} />
          ) : (
            <IoChevronDown className="text-gray-400" size={20} />
          )}
        </button>

        <div className={`transition-all duration-300 ease-in-out ${isPriceExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-5 bg-gradient-to-b from-white to-gray-50">
            <PriceRangeFilter
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange}
              onChange={onPriceChange}
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {isFiltered && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <IoSparkles className="text-amber-500 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">Active Filters</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-700">Price Range:</span>
                  <span className="text-sm font-bold text-amber-900">
                    ₹{selectedPriceRange[0]} - ₹{selectedPriceRange[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop with blur */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={onClose}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFilter className="text-blue-600" size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Filters & Sort</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-600" size={20} />
              </button>
            </div>
          </div>
          <div className="p-5">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-5 sticky top-6">
      {sidebarContent}
    </div>
  );
};

export default FilterSidebar;
