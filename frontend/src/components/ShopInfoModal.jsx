import { CheckCircle, MapPin, Phone, X, Edit } from "lucide-react";
import { ImageSlideshow } from "./utils/ImageSlideshow";

export const ShopInfoModal = ({ shop, onClose, onEdit }) => {
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
      {Icon && <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-gray-900 font-semibold">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden 
                          bg-white/90 border border-white/50 transform transition-all duration-300 scale-100"
      >
        <ImageSlideshow
          shopPhotos={shop.photos}
          shopName={shop.name}
          heightClass="h-56"
        />

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {shop.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 bg-white/50 backdrop-blur-sm rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onEdit(shop);
            }}
            className="w-full py-2 mb-6 flex items-center justify-center space-x-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-base shadow-md"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Shop Details</span>
          </button>

          <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
            <InfoRow icon={MapPin} label="Address" value={shop.address} />
            <InfoRow
              icon={Phone}
              label="Phone Number"
              value={shop.phone_number}
            />
            <InfoRow icon={MapPin} label="State/Region" value={shop.state} />
            <InfoRow
              icon={MapPin}
              label="LGA"
              value={shop.local_government_area}
            />
            <InfoRow icon={MapPin} label="Latitude" value={shop.latitude} />
            <InfoRow icon={MapPin} label="Longitude" value={shop.longitude} />
            <InfoRow
              icon={CheckCircle}
              label="Date Created"
              value={shop.date_created}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
