import React, { useState, useRef } from "react";
import { IoCloudUpload, IoClose, IoImage, IoSwapHorizontal, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";
import { FaExpand } from "react-icons/fa";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSIONS = { width: 300, height: 300 };
const RECOMMENDED_DIMENSIONS = { width: 1200, height: 800 };

const DesignUpload = ({
  onDesignsChange,
  frontDesign = null,
  backDesign = null,
  showBackDesign = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [front, setFront] = useState(frontDesign);
  const [back, setBack] = useState(backDesign);
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const validateFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No file selected");
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        reject("Invalid file type. Please upload JPG, PNG, or WebP images.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        reject(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
          reject(`Image too small. Minimum dimensions are ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px.`);
        } else {
          resolve({
            file,
            preview: URL.createObjectURL(file),
            width: img.width,
            height: img.height,
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject("Failed to load image. Please try another file.");
      };

      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (file, side) => {
    const setError = side === "front" ? setFrontError : setBackError;
    const setDesign = side === "front" ? setFront : setBack;
    const setUploading = side === "front" ? setFrontUploading : setBackUploading;

    setError("");
    setUploading(true);

    try {
      const validatedFile = await validateFile(file);
      setDesign(validatedFile);

      // Notify parent component
      const newDesigns = {
        front: side === "front" ? validatedFile : front,
        back: side === "back" ? validatedFile : back
      };
      onDesignsChange?.(newDesigns);
    } catch (err) {
      setError(err);
      setDesign(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e, side) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, side);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeDesign = (side) => {
    if (side === "front") {
      if (front?.preview) URL.revokeObjectURL(front.preview);
      setFront(null);
      setFrontError("");
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      if (back?.preview) URL.revokeObjectURL(back.preview);
      setBack(null);
      setBackError("");
      if (backInputRef.current) backInputRef.current.value = "";
    }

    const newDesigns = {
      front: side === "front" ? null : front,
      back: side === "back" ? null : back
    };
    onDesignsChange?.(newDesigns);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const UploadBox = ({ side, design, error, uploading, inputRef }) => {
    const hasDesign = design !== null;

    return (
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <IoImage className="text-blue-500" />
          {side === "front" ? "Front Design" : "Back Design"}
          {side === "front" && <span className="text-red-500">*</span>}
        </label>

        <div
          onDrop={(e) => handleDrop(e, side)}
          onDragOver={handleDragOver}
          className={`
            relative border-2 border-dashed rounded-xl transition-all duration-200
            ${hasDesign ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
            ${error ? "border-red-400 bg-red-50" : ""}
            ${uploading ? "opacity-60 pointer-events-none" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileSelect(file, side);
            }}
            className="hidden"
            id={`design-upload-${side}`}
          />

          {hasDesign ? (
            <div className="p-4">
              <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 group">
                <img
                  src={design.preview}
                  alt={`${side} design preview`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(design.preview)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Preview"
                  >
                    <FaExpand className="text-gray-700" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDesign(side)}
                    className="p-2 bg-white rounded-full hover:bg-red-100 transition"
                    title="Remove"
                  >
                    <IoClose className="text-red-600" size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <IoCheckmarkCircle size={18} />
                  <span className="text-sm font-medium">Uploaded</span>
                </div>
                <div className="text-xs text-gray-500">
                  {design.width} x {design.height}px | {formatFileSize(design.size)}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1 truncate" title={design.name}>
                {design.name}
              </p>
            </div>
          ) : (
            <label
              htmlFor={`design-upload-${side}`}
              className="flex flex-col items-center justify-center p-8 cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
              ) : (
                <IoCloudUpload className="text-gray-400 mb-3" size={40} />
              )}
              <span className="text-sm font-medium text-gray-700 mb-1">
                {uploading ? "Processing..." : "Click to upload or drag & drop"}
              </span>
              <span className="text-xs text-gray-500">
                JPG, PNG or WebP (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Min: {MIN_DIMENSIONS.width}x{MIN_DIMENSIONS.height}px | Recommended: {RECOMMENDED_DIMENSIONS.width}x{RECOMMENDED_DIMENSIONS.height}px
              </span>
            </label>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <IoAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
          ${isExpanded
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
          }
          ${(front || back) ? "border-green-400 bg-green-50" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${(front || back) ? "bg-green-100" : "bg-blue-100"}`}>
            <IoCloudUpload className={`${(front || back) ? "text-green-600" : "text-blue-600"}`} size={24} />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Upload Your Own Design</h4>
            <p className="text-sm text-gray-500">
              {(front || back)
                ? `${front ? "Front" : ""}${front && back ? " & " : ""}${back ? "Back" : ""} design uploaded`
                : "Add custom artwork for your cards"
              }
            </p>
          </div>
        </div>
        <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          <IoSwapHorizontal className="text-gray-400 rotate-90" size={20} />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-blue-800 mb-1">Design Guidelines</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use high-resolution images (min {MIN_DIMENSIONS.width}x{MIN_DIMENSIONS.height}px)</li>
              <li>• Accepted formats: JPG, PNG, WebP</li>
              <li>• Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB per image</li>
              <li>• Ensure important content is not at the edges (bleed area)</li>
            </ul>
          </div>

          <div className={`flex gap-6 ${showBackDesign ? "flex-col md:flex-row" : ""}`}>
            <UploadBox
              side="front"
              design={front}
              error={frontError}
              uploading={frontUploading}
              inputRef={frontInputRef}
            />

            {showBackDesign && (
              <UploadBox
                side="back"
                design={back}
                error={backError}
                uploading={backUploading}
                inputRef={backInputRef}
              />
            )}
          </div>

          {(front || back) && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <IoCheckmarkCircle className="text-green-600" size={20} />
              <span className="text-sm text-green-700">
                Your custom design will be printed on the cards. Our team will review before printing.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Full-screen preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            <IoClose className="text-white" size={24} />
          </button>
          <img
            src={previewImage}
            alt="Design preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DesignUpload;
