import React, { useState, useEffect, useRef, useCallback } from 'react';

const PriceRangeFilter = ({ min = 0, max = 10000, value = [0, 10000], onChange }) => {
  const [minValue, setMinValue] = useState(value[0]);
  const [maxValue, setMaxValue] = useState(value[1]);
  const [isDragging, setIsDragging] = useState(false);
  const debounceTimer = useRef(null);
  const minValRef = useRef(null);
  const maxValRef = useRef(null);
  const rangeRef = useRef(null);

  // Update local state when prop value changes (but not during dragging)
  useEffect(() => {
    if (!isDragging) {
      setMinValue(value[0]);
      setMaxValue(value[1]);
    }
  }, [value, isDragging]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debounced onChange to prevent too many API calls
  const debouncedOnChange = useCallback((newMin, newMax) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (onChange) {
        onChange([newMin, newMax]);
      }
      setIsDragging(false);
    }, 500); // Wait 500ms after user stops dragging
  }, [onChange]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
    setIsDragging(true);
    debouncedOnChange(value, maxValue);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
    setIsDragging(true);
    debouncedOnChange(minValue, value);
  };

  const handleMinInputChange = (e) => {
    const value = Math.min(Number(e.target.value) || 0, maxValue - 1);
    setMinValue(value);
    if (onChange) {
      onChange([value, maxValue]);
    }
  };

  const handleMaxInputChange = (e) => {
    const value = Math.max(Number(e.target.value) || 0, minValue + 1);
    setMaxValue(value);
    if (onChange) {
      onChange([minValue, value]);
    }
  };

  const formatPrice = (price) => {
    return `₹${Math.round(price).toLocaleString()}`;
  };

  // Calculate percentage for styling
  const getPercent = (value) => ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-6">
      {/* Dual Range Slider */}
      <div className="relative pt-2 pb-4 px-2">
        {/* Track Background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-2 bg-gray-200 rounded-full"></div>

        {/* Active Track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"
          style={{
            left: `calc(${getPercent(minValue)}% + 8px)`,
            right: `calc(${100 - getPercent(maxValue)}% + 8px)`,
          }}
        ></div>

        {/* Min Range Input */}
        <input
          ref={minValRef}
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
          style={{
            zIndex: minValue > max - 100 ? 5 : 3,
          }}
        />

        {/* Max Range Input */}
        <input
          ref={maxValRef}
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
          style={{
            zIndex: 4,
          }}
        />
      </div>

      {/* Price Input Fields */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Min Price
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-base font-bold z-10">₹</span>
            <input
              type="number"
              value={minValue}
              onChange={handleMinInputChange}
              className="relative w-full pl-10 pr-4 py-3.5 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
              placeholder="Min"
            />
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-400 font-bold text-xl mt-6">—</div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Max Price
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-base font-bold z-10">₹</span>
            <input
              type="number"
              value={maxValue}
              onChange={handleMaxInputChange}
              className="relative w-full pl-10 pr-4 py-3.5 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Selected Range Display */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 shadow-sm border border-blue-100">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full opacity-20 blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide flex items-center gap-2">
                Selected Range
                {isDragging && (
                  <span className="inline-flex items-center gap-1 text-yellow-600">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span className="text-xs">Updating...</span>
                  </span>
                )}
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatPrice(minValue)} - {formatPrice(maxValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Range</p>
              <p className="text-lg font-bold text-blue-600">
                {Math.round(((maxValue - minValue) / (max - min)) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type='range'] {
          pointer-events: all;
        }

        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid #3B82F6;
          cursor: grab;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1);
          transition: all 0.2s ease;
          pointer-events: all;
        }

        input[type='range']:active::-webkit-slider-thumb {
          cursor: grabbing;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6), 0 0 0 6px rgba(59, 130, 246, 0.15);
          transform: scale(1.1);
        }

        input[type='range']::-moz-range-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid #3B82F6;
          cursor: grab;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1);
          transition: all 0.2s ease;
          pointer-events: all;
        }

        input[type='range']:active::-moz-range-thumb {
          cursor: grabbing;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6), 0 0 0 6px rgba(59, 130, 246, 0.15);
          transform: scale(1.1);
        }

        /* Hide default track */
        input[type='range']::-webkit-slider-runnable-track {
          appearance: none;
          background: transparent;
        }

        input[type='range']::-moz-range-track {
          appearance: none;
          background: transparent;
        }

        /* Remove number input spinners */
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default PriceRangeFilter;
