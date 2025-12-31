import React, { useState, useEffect } from "react";
import { IoClose, IoChevronDown, IoCheckmarkCircle } from "react-icons/io5";
import { FaTag } from "react-icons/fa";
import { BsPhone, BsPhoneLandscape } from "react-icons/bs";

const ProductOptionsPanel = ({
  isOpen,
  onClose,
  product,
  attributes,
  selectedAttributes,
  onAttributeChange,
  onProceed,
  selectedPrice
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // MANDATORY: Card Orientation options (hardcoded - not from admin)
  const ORIENTATION_OPTIONS = [
    { id: "horizontal", name: "Horizontal", icon: BsPhoneLandscape },
    { id: "vertical", name: "Vertical", icon: BsPhone }
  ];

  // Filter out orientation-related keys from database attributes (we handle it separately)
  const filteredAttributeKeys = Object.keys(attributes).filter(key => {
    const normalizedKey = key.toLowerCase().replace(/[_\s]/g, "");
    return (
      normalizedKey !== "orientation" &&
      normalizedKey !== "productorientation" &&
      normalizedKey !== "quantity" &&
      normalizedKey !== "pricingtiers"
    );
  });

  // Build steps: Orientation (mandatory) -> Other attributes from DB -> Quantity
  const allSteps = ["orientation", ...filteredAttributeKeys, "quantity"];

  // Reset to first step when panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      // Pre-mark completed steps based on already selected attributes
      const completed = new Set();

      allSteps.forEach((key, index) => {
        if (selectedAttributes[key] !== undefined && selectedAttributes[key] !== "") {
          completed.add(index);
        }
      });
      setCompletedSteps(completed);
    }
  }, [isOpen]);

  const formatLabel = (name) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  // Helper: Check if attribute should render as buttons (vs dropdown)
  const shouldRenderAsButtons = (attrKey, attrValue) => {
    if (!Array.isArray(attrValue) || attrValue.length === 0) return false;

    const normalizedKey = attrKey.toLowerCase().replace(/[_\s]/g, "");

    // Keys that should always be buttons
    const buttonKeys = [
      "shape", "type", "deliveryspeed", "delivery_speed", "finish", "material"
    ];

    if (buttonKeys.includes(normalizedKey)) return true;

    // If there are 2-4 options, render as buttons
    if (attrValue.length >= 2 && attrValue.length <= 4) {
      const hasShortNames = attrValue.every((opt) => {
        const name = opt.name || opt.label || "";
        return name.length <= 30;
      });
      if (hasShortNames) return true;
    }

    return false;
  };

  const handleAttributeSelect = (key, value) => {
    onAttributeChange(key, value);
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const handleNext = () => {
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onProceed();
    }
  };

  const canProceed = () => {
    const currentKey = allSteps[currentStep];
    return selectedAttributes[currentKey] !== undefined && selectedAttributes[currentKey] !== "";
  };

  // Render MANDATORY Orientation Step
  const renderOrientationStep = () => {
    const selectedOrientation = selectedAttributes.orientation;

    return (
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Card Orientation
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose how your card design should be oriented
        </p>

        <div className="grid grid-cols-2 gap-4">
          {ORIENTATION_OPTIONS.map((option) => {
            const isSelected = selectedOrientation === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => handleAttributeSelect("orientation", option.id)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-200 text-center group
                  ${isSelected
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <IoCheckmarkCircle className="text-white" size={16} />
                  </div>
                )}

                <div className={`
                  w-20 h-20 mx-auto mb-3 rounded-xl flex items-center justify-center
                  ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
                  transition-colors
                `}>
                  <Icon size={40} />
                </div>

                <span className={`font-semibold text-lg ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                  {option.name}
                </span>

                <div className="mt-2 text-xs text-gray-500">
                  {option.id === "horizontal" ? "Landscape layout" : "Portrait layout"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Preview Hint */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            💡 The card preview will update based on your selection
          </p>
        </div>
      </div>
    );
  };

  const renderAttributeOptions = (attrKey) => {
    const attrValue = attributes[attrKey];
    if (!Array.isArray(attrValue) || attrValue.length === 0) return null;

    const selectedValue = selectedAttributes[attrKey];
    const normalizedKey = attrKey.toLowerCase().replace(/[_\s]/g, "");

    // Color picker for color attributes
    if (normalizedKey === "color" && attrValue[0]?.value?.startsWith("#")) {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {attrValue.map((option) => {
              const optionId = option.id || option.value || option.name;
              const isSelected = String(selectedValue) === String(optionId);

              return (
                <button
                  key={optionId}
                  onClick={() => handleAttributeSelect(attrKey, optionId)}
                  className={`
                    relative w-14 h-14 rounded-xl border-3 transition-all
                    ${isSelected ? "border-blue-500 scale-110 shadow-lg ring-4 ring-blue-100" : "border-gray-300 hover:border-gray-400 hover:scale-105"}
                  `}
                  style={{ backgroundColor: option.value }}
                  title={option.name}
                >
                  {isSelected && (
                    <IoCheckmarkCircle
                      className={`absolute -top-1 -right-1 ${option.value === "#FFFFFF" ? "text-blue-500" : "text-white"}`}
                      size={20}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {selectedValue && (
            <div className="text-sm text-gray-600">
              Selected: <span className="font-medium">{attrValue.find(o => (o.id || o.value || o.name) === selectedValue)?.name || selectedValue}</span>
            </div>
          )}
        </div>
      );
    }

    // Button-style rendering for eligible attributes
    if (shouldRenderAsButtons(attrKey, attrValue)) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {attrValue.map((option) => {
            const optionId = option.id || option.value || option.name;
            const optionName = option.name || option.label || option.value;
            const isSelected = String(selectedValue) === String(optionId);

            return (
              <button
                key={optionId}
                onClick={() => handleAttributeSelect(attrKey, optionId)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }
                `}
              >
                {isSelected && (
                  <IoCheckmarkCircle className="absolute top-2 right-2 text-blue-500" size={20} />
                )}
                <span className="font-medium text-gray-900">{optionName}</span>
                {option.price > 0 && (
                  <span className="block text-sm text-green-600 mt-1">+₹{option.price}</span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Default dropdown style
    return (
      <div className="relative">
        <select
          value={selectedValue || ""}
          onChange={(e) => handleAttributeSelect(attrKey, e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl py-4 px-4 pr-10 bg-white text-gray-900 font-medium appearance-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition text-lg"
        >
          <option value="">Select {formatLabel(attrKey)}...</option>
          {attrValue.map((option) => {
            const optionId = option.id || option.value || option.name;
            const optionName = option.name || option.label || option.value;
            let displayText = optionName;
            if (option.price > 0) displayText += ` (+₹${option.price})`;
            return (
              <option key={optionId} value={optionId}>
                {displayText}
              </option>
            );
          })}
        </select>
        <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={24} />
      </div>
    );
  };

  const renderQuantitySelector = () => {
    const quantityAttr = attributes.quantity || attributes.pricing_tiers || [];
    if (!Array.isArray(quantityAttr) || quantityAttr.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
          No quantity options available. Please contact support.
        </div>
      );
    }

    const selectedQty = selectedAttributes.quantity;

    return (
      <div className="space-y-4">
        {/* Dropdown */}
        <div className="relative">
          <select
            value={selectedQty || ""}
            onChange={(e) => handleAttributeSelect("quantity", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl py-4 px-4 pr-10 bg-white text-gray-900 font-medium appearance-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition text-lg"
          >
            <option value="">Select Quantity...</option>
            {quantityAttr.map((tier) => {
              const unitPrice = parseFloat(tier.unitPrice || tier.price / tier.quantity || 0);
              return (
                <option key={tier.id || tier.quantity} value={tier.quantity}>
                  {tier.quantity} (₹{unitPrice.toFixed(2)} / unit)
                </option>
              );
            })}
          </select>
          <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={24} />
        </div>

        {/* Quick quantity buttons */}
        <div className="grid grid-cols-3 gap-2">
          {quantityAttr.slice(0, 6).map((tier) => {
            const isSelected = String(selectedQty) === String(tier.quantity);
            const unitPrice = parseFloat(tier.unitPrice || tier.price / tier.quantity || 0);

            return (
              <button
                key={tier.id || tier.quantity}
                onClick={() => handleAttributeSelect("quantity", tier.quantity)}
                className={`
                  p-3 rounded-xl border-2 transition-all text-center
                  ${isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }
                `}
              >
                <div className={`font-bold text-lg ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                  {tier.quantity}
                </div>
                <div className="text-xs text-gray-500">₹{unitPrice.toFixed(2)}/unit</div>
              </button>
            );
          })}
        </div>

        {/* More quantities available notice */}
        {quantityAttr.length > 6 && (
          <p className="text-xs text-gray-500 text-center">
            More quantities available in dropdown above
          </p>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    const currentKey = allSteps[currentStep];

    // Step 1: Mandatory Orientation
    if (currentKey === "orientation") {
      return renderOrientationStep();
    }

    // Last Step: Quantity
    if (currentKey === "quantity") {
      return (
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Quantity
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Select the number of cards you need
          </p>
          {renderQuantitySelector()}
        </div>
      );
    }

    // Middle Steps: Other attributes from database
    const options = renderAttributeOptions(currentKey);

    return (
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          {formatLabel(currentKey)}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select your preferred {formatLabel(currentKey).toLowerCase()}
        </p>
        {options || (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            No options available for this attribute.
          </div>
        )}
      </div>
    );
  };

  const getStepLabel = (step) => {
    if (step === "orientation") return "Orientation";
    if (step === "quantity") return "Quantity";
    return formatLabel(step);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{product?.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your card options</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            {allSteps.map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => {
                    // Allow clicking on completed steps to go back
                    if (completedSteps.has(index) || index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${index === currentStep
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : completedSteps.has(index)
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {completedSteps.has(index) ? (
                    <IoCheckmarkCircle size={18} />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < allSteps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-1 rounded transition-colors ${
                      completedSteps.has(index) ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={{ minWidth: "20px", maxWidth: "40px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">
              {getStepLabel(allSteps[currentStep])}
            </span>
            <span className="text-xs text-gray-500">
              Step {currentStep + 1} of {allSteps.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderCurrentStep()}
        </div>

        {/* Footer with Price Summary */}
        <div className="border-t bg-gray-50 p-6">
          {/* Price Summary */}
          {selectedPrice && (
            <div className="mb-4 p-4 bg-white rounded-xl border shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaTag size={14} />
                <span className="text-sm font-medium">Price Summary</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">
                  {selectedPrice.quantity} cards
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{selectedPrice.total.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-green-600 text-right mt-1">
                ₹{selectedPrice.unit.toFixed(2)} per card
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3.5 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`
                flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all
                ${canProceed()
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {currentStep === allSteps.length - 1 ? "Confirm & Proceed" : "Continue"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProductOptionsPanel;
