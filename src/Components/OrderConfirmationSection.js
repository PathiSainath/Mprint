import React from "react";
import { IoCheckmarkCircle, IoAlertCircle, IoShieldCheckmark, IoDocumentText } from "react-icons/io5";
import { FaPrint, FaShippingFast, FaUndo } from "react-icons/fa";

const OrderConfirmationSection = ({
  confirmDesign,
  confirmTerms,
  onConfirmDesignChange,
  onConfirmTermsChange,
  hasAllDesigns,
  selectedPrice,
  selectedAttributes,
  formatLabel,
  className = ""
}) => {
  const canOrder = confirmDesign && confirmTerms && hasAllDesigns;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <IoShieldCheckmark className="text-green-500" />
          Order Confirmation
        </h3>
        <p className="text-sm text-gray-500 mt-1">Please review and confirm before ordering</p>
      </div>

      {/* Order Summary */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>

        <div className="space-y-3">
          {/* Quantity */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quantity</span>
            <span className="font-semibold text-gray-900">{selectedPrice?.quantity || 0} cards</span>
          </div>

          {/* Unit Price */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price per card</span>
            <span className="font-semibold text-gray-900">₹{selectedPrice?.unit?.toFixed(2) || "0.00"}</span>
          </div>

          {/* Selected Attributes */}
          {selectedAttributes && Object.entries(selectedAttributes).map(([key, value]) => {
            if (key === "quantity" || key === "pricing_tiers" || key === "custom_designs") return null;
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600">{formatLabel ? formatLabel(key) : key}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            );
          })}

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{selectedPrice?.total?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkboxes */}
      <div className="p-6 space-y-4">
        {/* Design Confirmation */}
        <label
          className={`
            flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${confirmDesign
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }
            ${!hasAllDesigns ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={confirmDesign}
              onChange={(e) => onConfirmDesignChange(e.target.checked)}
              disabled={!hasAllDesigns}
              className="sr-only"
            />
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                ${confirmDesign
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-gray-300"
                }
              `}
            >
              {confirmDesign && <IoCheckmarkCircle className="text-white" size={16} />}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FaPrint className="text-blue-500" size={16} />
              <span className="font-semibold text-gray-900">Design Confirmation</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              I confirm that my design is correct and ready for printing. I understand that the design will be printed exactly as uploaded.
            </p>
            {!hasAllDesigns && (
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <IoAlertCircle size={14} />
                Please upload both front and back designs first
              </p>
            )}
          </div>
        </label>

        {/* Terms Agreement */}
        <label
          className={`
            flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${confirmTerms
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }
          `}
        >
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={confirmTerms}
              onChange={(e) => onConfirmTermsChange(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                ${confirmTerms
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-gray-300"
                }
              `}
            >
              {confirmTerms && <IoCheckmarkCircle className="text-white" size={16} />}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <IoDocumentText className="text-blue-500" size={16} />
              <span className="font-semibold text-gray-900">Terms & Conditions</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 underline hover:no-underline">
                terms of service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 underline hover:no-underline">
                privacy policy
              </a>
              . I understand the production and delivery timelines.
            </p>
          </div>
        </label>
      </div>

      {/* Benefits/Guarantees */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <FaPrint className="text-blue-500 mx-auto mb-2" size={20} />
            <p className="text-xs font-medium text-gray-700">Quality Print</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <FaShippingFast className="text-green-500 mx-auto mb-2" size={20} />
            <p className="text-xs font-medium text-gray-700">Fast Delivery</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <FaUndo className="text-purple-500 mx-auto mb-2" size={20} />
            <p className="text-xs font-medium text-gray-700">Easy Returns</p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {!canOrder && (
        <div className="mx-6 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700">
            <IoAlertCircle size={18} />
            <span className="text-sm font-medium">
              {!hasAllDesigns
                ? "Upload both designs to proceed"
                : !confirmDesign
                ? "Confirm your design accuracy"
                : "Accept terms to proceed"
              }
            </span>
          </div>
        </div>
      )}

      {canOrder && (
        <div className="mx-6 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <IoCheckmarkCircle size={18} />
            <span className="text-sm font-medium">You're ready to order!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationSection;
