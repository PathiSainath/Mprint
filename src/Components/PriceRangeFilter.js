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
    return `₹${Math.round(price).toLocaleString()}`;
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="px-2 h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse"></div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-14 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Slider Container with glow effect */}
      <div className="px-2 py-4" ref={sliderRef}>
        <Slider
          range
          min={min}
          max={max}
          value={priceRange}
          onChange={handleSliderChange}
          trackStyle={[{
            backgroundColor: '#3B82F6',
            height: 8,
            borderRadius: 999,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          }]}
          handleStyle={[
            {
              borderColor: '#3B82F6',
              backgroundColor: '#FFFFFF',
              width: 24,
              height: 24,
              marginTop: -8,
              borderWidth: 4,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1)',
              transition: 'all 0.2s ease'
            },
            {
              borderColor: '#3B82F6',
              backgroundColor: '#FFFFFF',
              width: 24,
              height: 24,
              marginTop: -8,
              borderWidth: 4,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1)',
              transition: 'all 0.2s ease'
            }
          ]}
          railStyle={{
            backgroundColor: '#E5E7EB',
            height: 8,
            borderRadius: 999
          }}
        />
      </div>

      {/* Price Inputs with enhanced styling */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Min Price
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-base font-bold">₹</span>
            <input
              type="number"
              value={inputMin}
              onChange={(e) => handleInputChange('min', e.target.value)}
              className="relative w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-gray-900 transition-all hover:border-blue-300"
              min={min}
              max={max}
            />
          </div>
        </div>

        <div className="flex items-center justify-center mt-7">
          <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Max Price
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-base font-bold">₹</span>
            <input
              type="number"
              value={inputMax}
              onChange={(e) => handleInputChange('max', e.target.value)}
              className="relative w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-gray-900 transition-all hover:border-blue-300"
              min={min}
              max={max}
            />
          </div>
        </div>
      </div>

      {/* Current Range Display with gradient */}
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

        <div className="relative p-4 text-center">
          <p className="text-xs font-semibold text-white/80 mb-1 uppercase tracking-wide">
            Selected Range
          </p>
          <p className="text-2xl font-bold text-white">
            {formatPrice(priceRange[0])}
            <span className="mx-2 text-white/60">-</span>
            {formatPrice(priceRange[1])}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <p className="text-xs text-white/90">
              {max - priceRange[1] + priceRange[0] - min > 0
                ? `${Math.round(((priceRange[1] - priceRange[0]) / (max - min)) * 100)}% of total range`
                : 'Full range selected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
