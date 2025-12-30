import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const PriceRangeFilter = ({ min = 0, max = 10000, value = [0, 10000], onChange }) => {
  const [priceRange, setPriceRange] = useState(value);
  const [inputMin, setInputMin] = useState(value[0]);
  const [inputMax, setInputMax] = useState(value[1]);
  const [mounted, setMounted] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      setPriceRange(value);
      setInputMin(value[0]);
      setInputMax(value[1]);
    }
  }, [value, mounted]);

  const handleSliderChange = (newValue) => {
    if (!mounted) return;
    setPriceRange(newValue);
    setInputMin(newValue[0]);
    setInputMax(newValue[1]);
    if (onChange) onChange(newValue);
  };

  const handleInputChange = (type, val) => {
    if (!mounted) return;
    const numValue = parseFloat(val) || 0;
    let newRange = [...priceRange];

    if (type === 'min') {
      setInputMin(numValue);
      newRange[0] = Math.min(numValue, priceRange[1]);
    } else {
      setInputMax(numValue);
      newRange[1] = Math.max(numValue, priceRange[0]);
    }

    setPriceRange(newRange);
    if (onChange) onChange(newRange);
  };

  const formatPrice = (price) => {
    return `₹${Math.round(price)}`;
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="px-2 h-6 bg-gray-100 rounded animate-pulse"></div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-12 bg-gray-100 rounded animate-pulse"></div>
          <div className="flex-1 h-12 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-2" ref={sliderRef}>
        {/* Slider */}
        <Slider
          range
          min={min}
          max={max}
          value={priceRange}
          onChange={handleSliderChange}
          trackStyle={[{ backgroundColor: '#3B82F6', height: 6 }]}
          handleStyle={[
            {
              borderColor: '#3B82F6',
              backgroundColor: '#3B82F6',
              width: 20,
              height: 20,
              marginTop: -7,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            },
            {
              borderColor: '#3B82F6',
              backgroundColor: '#3B82F6',
              width: 20,
              height: 20,
              marginTop: -7,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }
          ]}
          railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
        />
      </div>

      {/* Price Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1.5">Min Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
            <input
              type="number"
              value={inputMin}
              onChange={(e) => handleInputChange('min', e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              min={min}
              max={max}
            />
          </div>
        </div>

        <span className="text-gray-400 mt-6">—</span>

        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1.5">Max Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
            <input
              type="number"
              value={inputMax}
              onChange={(e) => handleInputChange('max', e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              min={min}
              max={max}
            />
          </div>
        </div>
      </div>

      {/* Current Range Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-sm text-blue-800 font-medium">
          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </p>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
