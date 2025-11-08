import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useEffect, useState } from "react";

export const ImageSlideshow = ({
  shopPhotos = [],
  shopName,
  heightClass = "h-40",
}) => {
  const hasPhotos = shopPhotos.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect (runs only if there's more than one photo)
  useEffect(() => {
    if (!hasPhotos || shopPhotos.length < 2) return;

    // Set an interval to change the index every 3 seconds (3000ms)
    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [hasPhotos, shopPhotos.length]);

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? shopPhotos.length - 1 : prevIndex - 1
    );
  };

  const currentImageUrl = hasPhotos
    ? shopPhotos[currentImageIndex].photo // Assuming 'photo' holds the URL
    : null;

  return (
    <div
      className={`relative w-full ${heightClass} rounded-lg bg-gray-100 overflow-hidden`}
    >
      {hasPhotos ? (
        <>
          <img
            src={currentImageUrl}
            alt={`${shopName} photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          />

          {/* Navigation Buttons (Only visible if more than one photo) */}
          {shopPhotos.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicator Dots */}
          {shopPhotos.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 z-10">
              {shopPhotos.map((_, index) => (
                <span
                  key={index}
                  className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                ></span>
              ))}
            </div>
          )}
        </>
      ) : (
        // Placeholder for shops with no image
        <div className="w-full h-full flex items-center justify-center">
          <Store className="w-12 h-12 text-gray-300" />
        </div>
      )}
    </div>
  );
};
