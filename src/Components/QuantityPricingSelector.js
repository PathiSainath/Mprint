import React, { useMemo } from "react";
import { IoCheckmarkCircle, IoFlash, IoTrendingDown } from "react-icons/io5";
import { FaTag, FaPercent } from "react-icons/fa";

const QuantityPricingSelector = ({
  pricingTiers = [],
  selectedQuantity,
  onQuantityChange,
  basePrice = 0,
  className = ""
}) => {
  // Calculate savings percentage for each tier
  const tiersWithSavings = useMemo(() => {
    if (!pricingTiers.length) return [];

    const baseTier = pricingTiers[0];
    const baseUnitPrice = parseFloat(baseTier.unitPrice || baseTier.price / baseTier.quantity || basePrice);

    return pricingTiers.map((tier, index) => {
      const unitPrice = parseFloat(tier.unitPrice || tier.price / tier.quantity || 0);
      const totalPrice = parseFloat(tier.price || 0);
      const quantity = parseInt(tier.quantity || 0);

      // Calculate savings vs base tier
      const savingsPercent = index > 0 && baseUnitPrice > 0
        ? Math.round(((baseUnitPrice - unitPrice) / baseUnitPrice) * 100)
        : 0;

      // Calculate total savings amount
      const savingsAmount = index > 0
        ? (baseUnitPrice * quantity) - totalPrice
        : 0;

      return {
        ...tier,
        unitPrice,
        totalPrice,
        quantity,
        savingsPercent,
        savingsAmount,
        isPopular: index === Math.floor(pricingTiers.length / 2), // Middle tier is "popular"
        isBestValue: index === pricingTiers.length - 1 // Last tier is "best value"
      };
    });
  }, [pricingTiers, basePrice]);

  const selectedTier = tiersWithSavings.find(
    t => String(t.quantity) === String(selectedQuantity) || t.id === selectedQuantity
  );

  if (!pricingTiers.length) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FaTag className="text-blue-500" />
          Select Quantity
        </h4>
        {selectedTier?.savingsPercent > 0 && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <IoTrendingDown size={16} />
            Save {selectedTier.savingsPercent}%
          </div>
        )}
      </div>

      {/* Grid layout for pricing tiers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiersWithSavings.map((tier) => {
          const isSelected = String(tier.quantity) === String(selectedQuantity) || tier.id === selectedQuantity;

          return (
            <button
              key={tier.id || tier.quantity}
              type="button"
              onClick={() => onQuantityChange(tier.quantity)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }
              `}
            >
              {/* Badge */}
              {tier.isPopular && !tier.isBestValue && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <IoFlash size={10} />
                  Popular
                </div>
              )}
              {tier.isBestValue && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <FaPercent size={8} />
                  Best Value
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <IoCheckmarkCircle className="absolute top-2 right-2 text-blue-500" size={20} />
              )}

              {/* Quantity */}
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {tier.quantity.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mb-3">cards</div>

              {/* Unit price */}
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-blue-600">
                  ₹{tier.unitPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">/card</span>
              </div>

              {/* Total price */}
              <div className="text-sm text-gray-600 mt-1">
                Total: ₹{tier.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </div>

              {/* Savings badge */}
              {tier.savingsPercent > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  <IoTrendingDown size={12} />
                  Save {tier.savingsPercent}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary bar */}
      {selectedTier && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-600">Your Selection</div>
              <div className="text-xl font-bold text-gray-900">
                {selectedTier.quantity.toLocaleString()} Cards
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Price per card</div>
              <div className="text-xl font-bold text-blue-600">
                ₹{selectedTier.unitPrice.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Total Price</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{selectedTier.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {selectedTier.savingsAmount > 0 && (
              <div className="w-full sm:w-auto text-center sm:text-right bg-green-100 px-4 py-2 rounded-lg">
                <div className="text-xs text-green-700">You save</div>
                <div className="text-lg font-bold text-green-600">
                  ₹{selectedTier.savingsAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk order message */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Need more than {tiersWithSavings[tiersWithSavings.length - 1]?.quantity.toLocaleString()} cards?{" "}
          <a href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact us for custom bulk pricing
          </a>
        </p>
      </div>
    </div>
  );
};

export default QuantityPricingSelector;
