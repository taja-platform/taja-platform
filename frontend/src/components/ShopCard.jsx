import { ChevronLeft, ChevronRight, MapPin, Store } from "lucide-react";
import { useEffect, useState } from "react";
// Make sure this path matches where you created the file above
import { getOptimizedUrl } from '../utils/imageUtils';

export const ShopCard = ({ shop, onEdit, onView }) => {
  const shopPhotos = shop.photos || [];
  const hasPhotos = shopPhotos.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!hasPhotos || shopPhotos.length < 2) return;

    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [hasPhotos, shopPhotos.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? shopPhotos.length - 1 : prevIndex - 1
    );
  };

  // --- CHANGE HERE: OPTIMIZE THE URL ---
  // We request a width of 600px. This is perfect for the card size
  // but much smaller (file size) than the original upload.
  const currentImageUrl = hasPhotos
    ? getOptimizedUrl(shopPhotos[currentImageIndex].photo, 600)
    : null;

  return (
    <div
      className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl hover:border-gray-200 cursor-pointer"
      onClick={() => onView(shop)}
    >
      <div className="relative w-full h-40 rounded-lg mb-4 bg-gray-100 overflow-hidden">
        {hasPhotos ? (
          <>
            <img
              src={currentImageUrl}
              alt={`${shop.name} photo ${currentImageIndex + 1}`}
              // Added loading="lazy" for better performance on long lists
              loading="lazy" 
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />
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
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{shop.name}</h3>
      <p className="text-sm text-gray-500 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
        {shop.address}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
        <div>
          <span className="font-medium text-gray-500">Latitude:</span>{" "}
          {shop.latitude}
        </div>
        <div>
          <span className="font-medium text-gray-500">Longitude:</span>{" "}
          {shop.longitude}
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-500">Created:</span>{" "}
          {shop.date_created}
        </div>
      </div>
      <button
        onClick={() => onEdit(shop)}
        className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        Edit Details
      </button>
    </div>
  );
};