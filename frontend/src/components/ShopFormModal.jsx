import { useMemo, useState } from "react";
import { STATE_LGA_MAP } from "../config/state-lga-config";
import { toast } from "sonner";
import { Input } from "./utils/Input";
import { Select } from "./utils/Select";
import { CheckCircle, MapPin, Trash2, Upload, X } from "lucide-react";
import { useCurrentLocation } from "../utils/getCurrentLocation";

export const ShopFormModal = ({ shop, onClose, onSave }) => {
  const isEditing = !!shop?.id;
  const MAX_PHOTOS = 5;

  const [formData, setFormData] = useState(
    shop || {
      name: "",
      phone_number: "",
      address: "",
      state: "",
      local_government_area: "",
      latitude: null,
      longitude: null,
      description: shop?.description || "",
    }
  );

  const STATES = Object.keys(STATE_LGA_MAP).sort();

  const [existingPhotos, setExistingPhotos] = useState(shop?.photos || []);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  const totalCurrentPhotos = useMemo(() => {
    const originalPhotoCount = shop?.photos?.length || 0;
    const photosToKeep = originalPhotoCount - deletedPhotoIds.length;
    return photosToKeep + newFiles.length;
  }, [deletedPhotoIds, newFiles, shop]);

  const canAddMorePhotos = totalCurrentPhotos < MAX_PHOTOS;

  const handleRemoveExisting = (photoId) => {
    setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    setDeletedPhotoIds((prev) => [...prev, photoId]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const slotsAvailable = MAX_PHOTOS - totalCurrentPhotos;

    if (files.length > slotsAvailable) {
      setImageError(
        `You can only add ${slotsAvailable} more photo(s). The limit is ${MAX_PHOTOS}.`
      );
      e.target.value = null;
      return;
    }

    setImageError(null);
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "state") {
        return {
          ...prev,
          state: value,
          local_government_area: "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const mockToast = {
    success: (msg) => console.log(`[TOAST SUCCESS] ${msg}`),
    error: (msg) => console.error(`[TOAST ERROR] ${msg}`),
    info: (msg) => console.log(`[TOAST INFO] ${msg}`),
  };

  const handleLocationPin = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat?.lat,
      longitude: lat.lng,
    }));
    mockToast.info(`Location Pinned: Lat ${lat}, Lng ${lng}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      toast.error("Please pin the shop's location.");
      return;
    }

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== undefined && typeof value !== "object") {
        data.append(key, value);
      }
    });

    if (isEditing && deletedPhotoIds.length > 0) {
      deletedPhotoIds.forEach((id) => {
        data.append("photos_to_delete_ids", id);
      });
    }

    newFiles.forEach((file) => {
      data.append("uploaded_photos", file);
    });

    setIsLoading(true);
    onSave(data, isEditing ? shop.id : null);
  };

  const { getLocation, isLoading: locationLoading } =
    useCurrentLocation(handleLocationPin);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Shop" : "Add New Shop"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="pt-3 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-900" /> Location
              Coordinates
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                id="latitude"
                name="latitude"
                label="Latitude"
                type="number"
                step="0.000001"
                value={formData.latitude || ""}
                onChange={handleChange}
                readOnly={isLoading}
                required
              />
              <Input
                id="longitude"
                name="longitude"
                label="Longitude"
                type="number"
                step="0.000001"
                value={formData.longitude || ""}
                onChange={handleChange}
                readOnly={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading || isLoading}
                className="w-full py-3 flex items-center justify-center bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {locationLoading ? "Locating..." : "Use Current Location"}
              </button>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Photos (
              <span className="font-semibold text-blue-600">
                {totalCurrentPhotos}
              </span>{" "}
              / {MAX_PHOTOS} used)
            </label>

            <div className="flex flex-wrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-24">
              {existingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-transparent hover:border-red-500 transition-colors"
                >
                  <img
                    src={photo.photo}
                    alt={`Shop Photo ${photo.id}`}
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(photo.id)}
                    className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 opacity-90 transition-opacity duration-200 shadow-lg hover:bg-red-600 hover:text-white"
                    title="Mark for Deletion"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {newFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-green-500"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-xs text-center bg-green-500 text-white truncate px-1 font-semibold">
                    NEW
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(index)}
                    className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 transition-colors hover:bg-red-700"
                    title="Remove New File"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {canAddMorePhotos && (
                <label
                  htmlFor="photo-upload"
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Upload size={24} />
                  <span className="text-xs mt-1">Add Photo</span>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!canAddMorePhotos || isLoading}
                  />
                </label>
              )}

              {totalCurrentPhotos === 0 && (
                <p className="text-gray-500 text-sm italic py-8">
                  No photos loaded. Click "Add Photo" to begin!
                </p>
              )}
            </div>

            {imageError && (
              <p className="mt-2 text-sm font-medium text-red-600 flex items-center">
                <X size={16} className="mr-1" />
                {imageError}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Maximum **{MAX_PHOTOS}** photos allowed.
            </p>
          </div>
          <Input
            id="name"
            name="name"
            label="Shop Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            id="phone_number"
            name="phone_number"
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <Input
            id="address"
            name="address"
            label="Address (Optional)"
            type="text"
            value={formData.address}
            onChange={handleChange}
          />
          <Input
            id="description"
            name="description"
            label="Note (Optional)"
            type="text"
            value={formData.description || ""}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <span>{isEditing ? "Update Shop" : "Add Shop"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
