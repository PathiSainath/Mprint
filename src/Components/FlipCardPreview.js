import React, { useState, useRef } from "react";
import { IoImage, IoRefresh, IoCreate, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
import { BsPhone, BsPhoneLandscape } from "react-icons/bs";

const FlipCardPreview = ({
  frontDesign,
  backDesign,
  productName = "Card",
  orientation = "horizontal", // "horizontal" or "vertical"
  onEditFront,
  onEditBack,
  className = ""
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);

  const hasFront = frontDesign !== null;
  const hasBack = backDesign !== null;
  const hasAnyDesign = hasFront || hasBack;
  const hasAllDesigns = hasFront && hasBack;

  const isHorizontal = orientation === "horizontal";

  // Aspect ratio based on orientation
  const aspectRatioClass = isHorizontal ? "aspect-[16/10]" : "aspect-[10/16]";
  const cardDimensions = isHorizontal ? "w-full max-w-md" : "w-full max-w-xs mx-auto";

  const handleMouseEnter = () => {
    if (hasAnyDesign) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
  };

  const handleFlipClick = () => {
    setIsFlipped(!isFlipped);
  };

  const PlaceholderCard = ({ side, onEdit }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 ${isHorizontal ? "" : "py-8"}`}>
      <div className="p-4 bg-white/80 rounded-full mb-3">
        <IoImage className="text-gray-400" size={32} />
      </div>
      <p className="text-gray-500 font-medium mb-1">{side} Design</p>
      <p className="text-gray-400 text-sm mb-4">Not uploaded yet</p>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
      >
        <IoCreate size={16} />
        Add Design
      </button>
    </div>
  );

  const DesignCard = ({ design, side, onEdit }) => (
    <div className="relative w-full h-full group">
      <img
        src={design.preview}
        alt={`${side} design`}
        className="w-full h-full object-cover rounded-xl"
      />
      {/* Overlay with edit button */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium"
        >
          <IoCreate size={16} />
          Change
        </button>
      </div>
      {/* Side label */}
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
        {side}
      </div>
      {/* Success indicator */}
      <div className="absolute top-3 right-3 p-1.5 bg-green-500 rounded-full">
        <IoCheckmarkCircle className="text-white" size={16} />
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      {/* Header with Orientation Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Design Preview</h3>
          <div className="flex items-center gap-2 mt-1">
            {isHorizontal ? (
              <BsPhoneLandscape className="text-blue-500" size={16} />
            ) : (
              <BsPhone className="text-blue-500" size={16} />
            )}
            <span className="text-sm text-gray-500">
              {isHorizontal ? "Horizontal (Landscape)" : "Vertical (Portrait)"}
            </span>
          </div>
        </div>
        {hasAnyDesign && (
          <button
            onClick={handleFlipClick}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <IoRefresh size={16} />
            Flip Card
          </button>
        )}
      </div>

      {/* Status indicator */}
      {!hasAllDesigns && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
          hasAnyDesign ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-200"
        }`}>
          {hasAnyDesign ? (
            <>
              <FaExclamationTriangle className="text-yellow-500 flex-shrink-0" size={18} />
              <div>
                <p className="text-yellow-800 font-medium text-sm">Missing Design</p>
                <p className="text-yellow-600 text-xs">
                  {!hasFront ? "Front design" : "Back design"} is not uploaded.
                  <button
                    onClick={!hasFront ? onEditFront : onEditBack}
                    className="ml-1 text-yellow-700 underline hover:no-underline"
                  >
                    Add now
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <IoAlertCircle className="text-gray-400 flex-shrink-0" size={18} />
              <p className="text-gray-600 text-sm">Upload your designs to see a preview</p>
            </>
          )}
        </div>
      )}

      {hasAllDesigns && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <IoCheckmarkCircle className="text-green-500 flex-shrink-0" size={18} />
          <p className="text-green-700 text-sm font-medium">
            Both designs uploaded! Hover over the card to flip.
          </p>
        </div>
      )}

      {/* 3D Flip Card Container */}
      <div className={`${cardDimensions}`}>
        <div
          ref={cardRef}
          className={`relative ${aspectRatioClass} cursor-pointer`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleFlipClick}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
              {hasFront ? (
                <DesignCard design={frontDesign} side="Front" onEdit={onEditFront} />
              ) : (
                <PlaceholderCard side="Front" onEdit={onEditFront} />
              )}
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {hasBack ? (
                <DesignCard design={backDesign} side="Back" onEdit={onEditBack} />
              ) : (
                <PlaceholderCard side="Back" onEdit={onEditBack} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instruction text */}
      <p className="text-center text-sm text-gray-500 mt-4">
        {hasAnyDesign
          ? "Hover or click to flip the card and see both sides"
          : "Upload your front and back designs above"
        }
      </p>

      {/* Side indicators */}
      <div className="flex justify-center gap-6 mt-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          !isFlipped ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
        }`}>
          <div className={`w-2 h-2 rounded-full ${hasFront ? "bg-green-500" : "bg-gray-400"}`} />
          Front
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          isFlipped ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
        }`}>
          <div className={`w-2 h-2 rounded-full ${hasBack ? "bg-green-500" : "bg-gray-400"}`} />
          Back
        </div>
      </div>

      {/* Card Size Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
        <p className="text-xs text-gray-500">
          Standard Business Card: {isHorizontal ? "3.5\" × 2\"" : "2\" × 3.5\""}
        </p>
      </div>
    </div>
  );
};

export default FlipCardPreview;
