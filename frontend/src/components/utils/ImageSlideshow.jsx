import { ChevronLeft, ChevronRight, Store, Maximize2 } from "lucide-react"; // Added Maximize2
import { useEffect, useState } from "react";
import { ImageViewer } from "./ImageViewer"; // Import the new component

export const ImageSlideshow = ({
  shopPhotos = [],
  shopName,
  heightClass = "h-40",
}) => {
  const hasPhotos = shopPhotos.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false); // State for full-screen viewer

  useEffect(() => {
    if (!hasPhotos || shopPhotos.length < 2) return;
    // Don't auto-slide if the viewer is open to avoid confusion
    if (isViewerOpen) return;

    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [hasPhotos, shopPhotos.length, isViewerOpen]);

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
    ? shopPhotos[currentImageIndex].photo
    : null;

  return (
    <>
      <div
        className={`relative w-full ${heightClass} rounded-lg bg-gray-100 overflow-hidden group`}
      >
        {hasPhotos ? (
          <>
            <img
              src={currentImageUrl}
              alt={`${shopName} photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />

            {/* EXPAND BUTTON - Visible on Hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsViewerOpen(true);
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              title="View Full Screen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {shopPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

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
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Render Full Screen Viewer if Open */}
      {isViewerOpen && (
        <ImageViewer
          photos={shopPhotos}
          initialIndex={currentImageIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
};