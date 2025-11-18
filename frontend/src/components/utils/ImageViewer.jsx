import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getOptimizedUrl } from "../../utils/imageUtils"; // Adjust path if needed

export const ImageViewer = ({ photos, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Prevent scrolling body when modal is open
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const currentPhoto = photos[currentIndex];

  // Request a much larger image for full screen (e.g., 1280px wide)
  const largeImageUrl = getOptimizedUrl(currentPhoto?.photo, 1280);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Main Image Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={largeImageUrl}
          alt="Full view"
          className="max-h-full max-w-full object-contain rounded-sm shadow-2xl"
        />

        {/* Navigation Controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full text-white text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};