import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
// import ShopFormModal from "./ShopFormModal";
import { toast } from "sonner";
import { X, Upload, Trash2 } from 'lucide-react';


import api from "../api/api";

const BACKEND_API_BASE_URL = "http://localhost:8000/";
const MAX_PHOTOS = 5; 


const ChevronLeft = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
const ChevronRight = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
const LayoutDashboard = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);
const User = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const Store = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2a2 2 0 012 2v2M7 21h10a2 2 0 002-2v-6m-4 0v-2"
    />
  </svg>
);
const MapPin = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const LogOut = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-5a3 3 0 013-3h5"
    />
  </svg>
);
const MenuIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const XIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const CheckCircle = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const Plus = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const Edit = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const Phone = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.49 5.49l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);


const mockToast = {
  success: (msg) => console.log(`[TOAST SUCCESS] ${msg}`),
  error: (msg) => console.error(`[TOAST ERROR] ${msg}`),
  info: (msg) => console.log(`[TOAST INFO] ${msg}`),
};

// --- Nav Item Component (UNCHANGED) ---
const NavItem = ({ icon: Icon, title, isActive, onClick }) => (
  <a
    href="#"
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-gray-800 text-white shadow-md"
        : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{title}</span>
  </a>
);

// --- Form Element  ---

// --- Data Map for State and LGA ---
const STATE_LGA_MAP = {
  Lagos: [
    "Ikeja",
    "Surulere",
    "Eti-Osa",
    "Badagry",
    "Epe",
    "Kosofe",
    "Alimosho",
    "Oshodi-Isolo",
    "Agege",
    "Amuwo-Odofin",
  ],
  Abuja: [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
  ],
  Kano: [
    "Dala",
    "Fagge",
    "Gwale",
    "Kumbotso",
    "Nassarawa",
    "Tarauni",
    "Tofa",
    "Kano Municipal",
  ],
  Oyo: [
    "Ibadan North",
    "Ibadan South-West",
    "Ibadan North-East",
    "Ogbomosho North",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Atiba",
    "Afijio",
  ],
};

// Extracting a sorted list of States for the first dropdown
const STATES = Object.keys(STATE_LGA_MAP).sort();

// --- Select Component (NEW) ---

const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);

  // Determine if the floating label effect should be active
  const isFloating = focused || value;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFloating
            ? "top-2 text-xs text-gray-700 font-medium"
            : "top-4 text-gray-500"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value || ""} // Use empty string for controlled component if value is null
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={`w-full h-14 px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 
                    ${
                      disabled
                        ? "bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none`}
        required={required}
      >
        {/* Placeholder/Initial Option */}
        <option value="" disabled></option>

        {/* Options from the provided array */}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {/* Custom chevron icon for select */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

const Input = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  required = false,
  step,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-200 ${
          focused || value ? "transform -translate-y-2" : ""
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || value
              ? "top-2 text-xs text-gray-700 font-medium"
              : "top-4 text-gray-500"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          step={step}
          className={`w-full h-14 px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            readOnly
              ? "bg-gray-100 cursor-not-allowed"
              : focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
          readOnly={readOnly}
          required={required}
        />
      </div>
    </div>
  );
};

const Textarea = ({ id, name, label, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-200 ${
          focused || value ? "transform -translate-y-2" : ""
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || value
              ? "top-2 text-xs text-gray-700 font-medium"
              : "top-4 text-gray-500"
          }`}
        >
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          rows="3"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
        />
      </div>
    </div>
  );
};

// --- NEW: ImageSlideshow Component (Logic extracted from previous ShopCard) ---
const ImageSlideshow = ({ shopPhotos = [], shopName, heightClass = 'h-40' }) => {
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
        <div className={`relative w-full ${heightClass} rounded-lg bg-gray-100 overflow-hidden`}>
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

// --- Shop Info Modal Component (Glassmorphism Effect) ---
const ShopInfoModal = ({ shop, onClose, onEdit }) => {
    // Helper to render info rows
    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
            <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-gray-900 font-semibold">{value || "N/A"}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden 
                          bg-white/90 border border-white/50 transform transition-all duration-300 scale-100">
                
                {/* Image Slideshow (Header) */}
                <ImageSlideshow 
                    shopPhotos={shop.photos} 
                    shopName={shop.name} 
                    heightClass="h-56" // Taller image for the modal
                />

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {shop.name}
                        </h2>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-900 bg-white/50 backdrop-blur-sm rounded-full transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => {
                            onClose(); // Close info modal
                            onEdit(shop); // Open edit modal
                        }}
                        className="w-full py-2 mb-6 flex items-center justify-center space-x-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-base shadow-md"
                    >
                        <Edit className="w-5 h-5" />
                        <span>Edit Shop Details</span>
                    </button>
                    
                    {/* Information Grid */}
                    <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                        <InfoRow 
                            icon={MapPin} 
                            label="Address" 
                            value={shop.address} 
                        />
                         <InfoRow 
                            icon={Phone} 
                            label="Phone Number" 
                            value={shop.phone_number} 
                        />
                        <InfoRow 
                            icon={MapPin} 
                            label="State/Region" 
                            value={shop.state} 
                        />
                        <InfoRow 
                            icon={MapPin} 
                            label="LGA" 
                            value={shop.local_government_area} 
                        />
                        <InfoRow 
                            icon={MapPin} 
                            label="Latitude" 
                            value={shop.latitude} 
                        />
                        <InfoRow 
                            icon={MapPin} 
                            label="Longitude" 
                            value={shop.longitude} 
                        />
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

// --- Shop Management Component ---
const ShopCard = ({ shop, onEdit, onView, rootBackEnd }) => {
  const shopPhotos = shop.photos || [];
  const hasPhotos = shopPhotos.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (!hasPhotos || shopPhotos.length < 2) return;

    // Set an interval to change the index every 3 seconds (3000ms)
    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(slideInterval);
  }, [hasPhotos, shopPhotos.length]);

  const handleNext = (e) => {
    e.stopPropagation(); // Prevent card click/other side effects
    setCurrentImageIndex((prevIndex) =>
      prevIndex === shopPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = (e) => {
    e.stopPropagation(); // Prevent card click/other side effects
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? shopPhotos.length - 1 : prevIndex - 1
    );
  };

  // The URL of the currently displayed image
  const currentImageUrl = hasPhotos
    ? shopPhotos[currentImageIndex].photo // Assuming 'photo' holds the URL
    : null;

  return (
    <div 
        className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl hover:border-gray-200 cursor-pointer"
        onClick={() => onView(shop)} // New onView handler
    >      {/* --- SLIDESHOW CONTAINER --- */}
      <div className="relative w-full h-40 rounded-lg mb-4 bg-gray-100 overflow-hidden">
        {hasPhotos ? (
          <>
            <img
              // Use the current image URL
              src={currentImageUrl}
              alt={`${shop.name} photo ${currentImageIndex + 1}`}
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

            {/* Indicator Dots (Optional) */}
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
      {/* --- END SLIDESHOW CONTAINER --- */}

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

const ShopFormModal = ({ shop, onClose, onSave }) => {
    // FIX: Using optional chaining for a clean null check
    const isEditing = !!shop?.id;

    const [formData, setFormData] = useState(
        shop || {
            name: "",
            phone_number: "",
            address: "",
            state: "",
            local_government_area: "",
            latitude: null,
            longitude: null,
            // Ensure any other required fields are here, e.g., description
            description: shop?.description || "", 
        }
    );

    // --- NEW STATES FOR IMAGE MANAGEMENT ---
    // Photos currently saved in the DB (used for display and marking for deletion)
    const [existingPhotos, setExistingPhotos] = useState(shop?.photos || []); 
    // New files selected for upload
    const [newFiles, setNewFiles] = useState([]); 
    // IDs of photos to be deleted
    const [deletedPhotoIds, setDeletedPhotoIds] = useState([]); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(null); // State for image validation errors

    // Get LGAs based on the currently selected state
    const lgaOptions = STATE_LGA_MAP[formData.state] || [];


    // --- COMPUTED VALUES FOR LIMIT CHECKING ---
    const totalCurrentPhotos = useMemo(() => {
        // Photos to keep = (Original total photos - deleted photos) + new uploads
        const originalPhotoCount = shop?.photos?.length || 0;
        const photosToKeep = originalPhotoCount - deletedPhotoIds.length;
        return photosToKeep + newFiles.length;
    }, [deletedPhotoIds, newFiles, shop]);

    const canAddMorePhotos = totalCurrentPhotos < MAX_PHOTOS;


    // --- IMAGE HANDLERS ---
    
    // Handler to mark an existing photo for deletion
    const handleRemoveExisting = (photoId) => {
        // 1. Remove from the visible list (`existingPhotos` state)
        setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
        // 2. Add to the list to be deleted on submit (`deletedPhotoIds` state)
        setDeletedPhotoIds(prev => [...prev, photoId]);
    };

    // Handler to remove a newly added file from the queue
    const handleRemoveNewFile = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setImageError(null);
    };

    // Modified handler for file selection with limit check
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const slotsAvailable = MAX_PHOTOS - totalCurrentPhotos;

        if (files.length > slotsAvailable) {
            setImageError(`You can only add ${slotsAvailable} more photo(s). The limit is ${MAX_PHOTOS}.`);
            e.target.value = null; // Clear input
            return;
        }

        setImageError(null);
        setNewFiles(prev => [...prev, ...files]);
        e.target.value = null; // Clear input
    };
    
    // Existing handlers
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "state") {
                return {
                    ...prev,
                    state: value,
                    local_government_area: "", // Reset LGA when state changes
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleLocationPin = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
        mockToast.info(`Location Pinned: Lat ${lat}, Lng ${lng}`);
    };

    const useCurrentLocation = () => {
        setIsLoading(true);
        mockToast.info("Requesting current location...");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleLocationPin(
                        position.coords.latitude.toFixed(6),
                        position.coords.longitude.toFixed(6)
                    );
                    setIsLoading(false);
                },
                (error) => {
                    toast.error(
                        "Could not get location. Ensure permissions are granted."
                    );
                    console.error("Geolocation error:", error);
                    setIsLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
            setIsLoading(false);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        
        // --- VALIDATION ---
        if (!formData.state) {
            toast.error("Please select a State/Region.");
            return;
        }
        if (!formData.local_government_area) {
            toast.error("Please select a Local Government Area.");
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            toast.error("Please pin the shop's location.");
            return;
        }

        // --- API PAYLOAD CONSTRUCTION (CRITICAL UPDATE) ---
        // Must use FormData for file uploads
        const data = new FormData();

        // 1. Append all standard form fields
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            // Skip complex objects/arrays and null/undefined values
            if (value !== null && value !== undefined && typeof value !== 'object') {
                data.append(key, value);
            }
        });
        
        // 2. Handle deletions (only in edit mode)
        if (isEditing && deletedPhotoIds.length > 0) {
            // Must JSON stringify the array for DRF to correctly parse ListField from FormData
            data.append('photos_to_delete_ids', JSON.stringify(deletedPhotoIds));
        }

        // 3. Append new photo files
        newFiles.forEach(file => {
            // 'uploaded_photos' MUST match the ListField name in your ShopSerializer
            data.append('uploaded_photos', file); 
        });

        setIsLoading(true);
        
        // Pass the FormData payload and the shop ID (if editing) to the parent function
        onSave(data, isEditing ? shop.id : null); 
        
        // NOTE: The `onSave` function in the parent component should now handle the actual API call 
        // (POST for new shop, PUT/PATCH for edit shop) and manage setting `isLoading` back to false 
        // and calling `onClose` upon success.
        
        // Mock success for development flow:
        setTimeout(() => {
             toast.success(`Shop ${isEditing ? "updated" : "added"} successfully!`);
             setIsLoading(false);
             onClose(); 
         }, 1000);
    };


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
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <Input
                        id="name"
                        name="name"
                        label="Shop Name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
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
                        label="Full Address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="description"
                        name="description"
                        label="Description (Optional)"
                        type="text"
                        value={formData.description || ''}
                        onChange={handleChange}
                    />

                    {/* State/LGA Selection */}
                    <Select
                        id="state"
                        name="state"
                        label="State/Region"
                        value={formData.state}
                        onChange={handleChange}
                        options={STATES} 
                        required
                    />
                    <Select
                        id="local_government_area"
                        name="local_government_area"
                        label="Local Government Area"
                        value={formData.local_government_area}
                        onChange={handleChange}
                        options={lgaOptions} 
                        required
                        disabled={!formData.state || lgaOptions.length === 0}
                    />

                    {/* --- PHOTO DISPLAY AND UPLOAD SECTION (Updated) --- */}
                    <div className="pt-3 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shop Photos (<span className="font-semibold text-blue-600">{totalCurrentPhotos}</span> / {MAX_PHOTOS} used)
                        </label>

                        {/* Photo Display Grid */}
                        <div className="flex flex-wrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-24">
                            
                            {/* 1. Existing Photos (Kept) */}
                            {existingPhotos.map((photo) => (
                                <div key={photo.id} className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-transparent hover:border-red-500 transition-colors">
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

                            {/* 2. Newly Added Files (Preview) */}
                            {newFiles.map((file, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-green-500">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={file.name} 
                                        className="w-full h-full object-cover"
                                        onLoad={(e) => URL.revokeObjectURL(e.target.src)} 
                                    />
                                    <span className="absolute bottom-0 left-0 right-0 text-xs text-center bg-green-500 text-white truncate px-1 font-semibold">NEW</span>
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

                            {/* 3. Add Image Button (File Input) */}
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
                                        onChange={handleImageChange} 
                                        className="hidden"
                                        disabled={!canAddMorePhotos || isLoading}
                                    />
                                </label>
                            )}
                            
                            {/* Empty state or limit reached message */}
                            {totalCurrentPhotos === 0 && (
                                <p className="text-gray-500 text-sm italic py-8">No photos loaded. Click "Add Photo" to begin!</p>
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
                    {/* --- END PHOTO SECTION --- */}


                    {/* Location Coordinates Section */}
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
                                onClick={useCurrentLocation}
                                disabled={isLoading}
                                className="w-full py-3 flex items-center justify-center bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {isLoading ? "Locating..." : "Use Current Location"}
                            </button>

                            <div className="text-center text-sm text-gray-500 py-2">
                                - OR -
                            </div>

                            {/* Simulated Map */}
                            <div
                                className="h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer text-gray-500 hover:bg-gray-200 transition-colors"
                                onClick={() =>
                                    handleLocationPin(
                                        (34.053 + (Math.random() * 0.01)).toFixed(4),
                                        (-118.243 - (Math.random() * 0.01)).toFixed(4)
                                    )
                                }
                            >
                                <p className="text-center">
                                    Click here to simulate selecting a new location from a map.
                                    <br />
                                    (Lat/Lng will be auto-filled)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
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


const ProfileEditor = ({ profile, onSave, user, updateUser }) => {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ CORRECTED: Send a FLAT payload to match AgentSerializer
      const payload = {
        first_name: formData.first_name, // Flat field
        last_name: formData.last_name, // Flat field
        email: formData.email, // Flat field
        phone_number: formData.phone_number,
        address: formData.address,
        state: formData.state,
      };

      const res = await api.patch(`/accounts/me/`, payload);

      toast.success("Details updated successfulljy!");

      updateUser(res.data); // Update context with new user data
    } catch (err) {
      // ✅ ADD THIS LOGGING BLOCK
      console.error("--- FULL API ERROR RESPONSE ---");
      if (err.response) {
        // This will print the exact validation error from Django
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Error:", err.message);
      }
      console.error("-----------------------------");

      toast.error(
        err.response?.data?.detail ||
          "Failed to update agent. Check console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setIsPasswordLoading(true);

    try {
      const payload = {
        password: passwordData.new,
        current_password: passwordData.current,
      };

      const response = await api.patch("/accounts/me/", payload);
      toast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("--- FULL API ERROR RESPONSE ---");
      if (err.response) {
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Error:", err.message);
      }
      console.error("-----------------------------");
      toast.error(
        err.response?.data?.detail ||
          "Failed to change password. Check console for details."
      );
    } finally {
      setIsPasswordLoading(false);
      setFormData({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="space-y-8">
      {/* General Information Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Agent Information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <Input
            id="agent_id"
            label="Agent ID"
            type="text"
            value={formData.agent_id}
            readOnly
          />
          <Input
            id="firsrt_name"
            name="first_name"
            label="First Name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <Input
            id="last_name"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            type="text"
            required
          />
          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            readOnly
            required
          />
          <Input
            id="phone_number"
            name="phone_number"
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <Textarea
            id="address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-6 h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <span>Update Profile</span>
            )}
          </button>
        </form>
      </div>

      {/* Password Management Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            id="current"
            name="current"
            label="Current Password"
            type="password"
            value={passwordData.current}
            onChange={handlePasswordChange}
            required
          />
          <Input
            id="new"
            name="new"
            label="New Password"
            type="password"
            value={passwordData.new}
            onChange={handlePasswordChange}
            required
          />
          <Input
            id="confirm"
            name="confirm"
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm}
            onChange={handlePasswordChange}
            required
          />

          <button
            type="submit"
            disabled={isPasswordLoading}
            className="w-full md:w-auto px-6 h-12 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isPasswordLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              <span>Change Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Dashboard Component (UNCHANGED) ---

const DashboardView = ({ totalShops, shopsToday }) => {
  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  const ActivityItem = ({ title, time, icon: Icon, color }) => (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
      <div className={`p-2 rounded-lg ${color} text-white flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Taja Agent Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Shops Added Today"
          value={shopsToday}
          icon={Plus}
          color="bg-gray-900"
        />
        <Card
          title="Total Shops Captured"
          value={totalShops}
          icon={Store}
          color="bg-green-600"
        />
        <Card
          title="Profile Completion"
          value="90%"
          icon={User}
          color="bg-indigo-600"
        />
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
          Recent Shop Activity
        </h2>
        <div className="divide-y divide-gray-100">
          <ActivityItem
            title="New shop 'Tech Repair Hub' added."
            time="5 minutes ago"
            icon={MapPin}
            color="bg-blue-500"
          />
          <ActivityItem
            title="Updated coordinates for 'QuickStop Groceries'."
            time="2 hours ago"
            icon={MapPin}
            color="bg-yellow-500"
          />
          <ActivityItem
            title="Completed profile update."
            time="Yesterday"
            icon={User}
            color="bg-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

// --- Main AgentDashboard Component (UPDATED) ---

const AgentDashboard = () => {
  const [view, setView] = useState("dashboard"); // 'dashboard', 'profile', 'shops'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Change initial state to an empty array for data fetching
  const [shops, setShops] = useState([]);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [isShopsLoading, setIsShopsLoading] = useState(true); 

  const [showInfoModal, setShowInfoModal] = useState(false);

  const { user, logout, updateUser, fetchUserProfile } =
    useContext(AuthContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [profile, setProfile] = useState({
    agent_id: user?.agent_id || "AGT0042",
    first_name: user?.user.first_name || "g",
    last_name: user?.user.last_name || "",
    email: user?.user.email || "",
    phone_number: user?.phone_number || "555-0199",
    address: user?.address || "123 Main St, Anytown, State 90210",
    state: user?.state || "California",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        agent_id: user?.agent_id || "AGT0042",
        first_name: user?.user?.first_name || "g",
        last_name: user?.user?.last_name || "",
        email: user?.user?.email || "",
        phone_number: user?.phone_number || "555-0199",
        address: user?.address || "123 Main St, Anytown, State 90210",
        state: user?.state || "California",
      });
    }
  }, [user]); // runs whenever 'user' changes

  // 1. NEW: Function to fetch shops from the API
  const fetchShops = useCallback(async () => {
    setIsShopsLoading(true);
    try {
      // Assuming your API endpoint for agent's shops is /shops/
      const response = await api.get("/shops/my-shops/");

      // Update the shops state with the data from the API
      setShops(response.data);
      console.log("Fetched shops:", response.data);
      // Replace mockToast with actual toast for better feedback
      toast.success(`Successfully loaded ${response.data.length} shops.`);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      toast.error("Failed to load shops. Please try again.");
      setShops([]); // Reset shops on error
    } finally {
      setIsShopsLoading(false);
    }
  }, []);

  // 2. NEW: useEffect to fetch shops when the component mounts
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  // Filter shops added today for the dashboard count
  // This now checks the shops fetched from the API

  const today = new Date().toISOString().split("T")[0];

  const shopsTodayCount = shops.filter((shop) => {
    const shopDate = new Date(shop.date_created).toISOString().split("T")[0];
    return shopDate === today;
  }).length;

  const handleProfileSave = (newProfileData) => {
    setProfile(newProfileData);
  };

  

  const handleSaveShop = async (formDataPayload, shopId = null) => {
      setShopModalOpen(false);
      setCurrentShop(null);

      const isUpdating = !!shopId;
      
      try {
          if (isUpdating) {
              await api.patch(`/shops/${shopId}/`, formDataPayload);
          } else {
              await api.post("/shops/", formDataPayload);
          }

          toast.success(`Shop ${isUpdating ? "updated" : "added"} successfully!`);
          await fetchShops(); // Re-fetch shops to see the changes
      } catch (error) {
          console.error(`Failed to ${isUpdating ? "update" : "add"} shop:`, error.response?.data);
          
          let errorMessage = `Failed to ${isUpdating ? "update" : "add"} shop.`;
          if (error.response?.data && typeof error.response.data === 'object') {
              const details = Object.entries(error.response.data)
                  .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                  .join(' | ');
              errorMessage = `${errorMessage} Details: ${details}`;
          }

          toast.error(errorMessage);
      }
  };

  const openAddShopModal = () => {
    setCurrentShop(null);
    setShopModalOpen(true);
  };

  const openEditShopModal = (shop) => {
    setCurrentShop(shop);
    setShopModalOpen(true);
  };

  const openInfoModal = (shop) => {
      setCurrentShop(shop);
      setShowInfoModal(true);
  };
  
  const closeInfoModal = () => {
      setCurrentShop(null);
      setShowInfoModal(false);
  };

  const renderView = () => {
    switch (view) {
      case "profile":
        return (
          <ProfileEditor
            profile={profile}
            onSave={handleProfileSave}
            user={user}
            updateUser={updateUser}
          />
        );
      case "shops":
        return (
          <ShopsManager
            shops={shops}
            onAdd={openAddShopModal}
            onEdit={openEditShopModal}
            onView={openInfoModal}
            isLoading={isShopsLoading} // Pass loading state
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardView
            totalShops={shops.length}
            shopsToday={shopsTodayCount}
          />
        );
    }
  };

  // 4. UPDATED: Add loading state to ShopsManager
  const ShopsManager = ({ shops, onAdd, onEdit, onView, isLoading }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New Shop</span>
        </button>
      </div>

      {/* Show Loading State */}
      {isLoading && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
          <div className="w-10 h-10 border-4 border-gray-900/30 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shops...</p>
        </div>
      )}

      {/* Show Shops List */}
      {!isLoading && shops.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            // Ensure your shop data from the API includes the fields used in ShopCard
            <ShopCard key={shop.id} shop={shop} onEdit={onEdit} onView={onView} rootBackEnd={BACKEND_API_BASE_URL} />
          ))}
        </div>
      )}

      {/* Show Empty State */}
      {!isLoading && shops.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            No shops added yet. Start by adding your first shop!
          </p>
        </div>
      )}
    </div>
  );

  // Define navigation items
  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Shop Management", icon: Store, view: "shops" },
    { title: "My Profile", icon: User, view: "profile" },
  ];

  // Function to handle the backdrop click on mobile
  const handleBackdropClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans flex">
        {/* Mobile Header/Nav Button (Visible below md screen size) */}
        <header className="fixed top-0 left-0 right-0 md:hidden z-40 bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Agent Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-700 rounded-lg hover:bg-gray-200"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </header>

        {/* Backdrop for Mobile Sidebar (NEW) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
            onClick={handleBackdropClick}
          ></div>
        )}

        {/* Sidebar (Desktop) / Mobile Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out h-screen overflow-y-hidden 
                    md:translate-x-0 md:flex-shrink-0
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Logo/Title */}
            <div className="text-white text-2xl font-extrabold mb-8 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-400" />
              <span>Agent Portal</span>
            </div>

            {/* Navigation */}
            <nav className="flex-grow space-y-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.view}
                  icon={item.icon}
                  title={item.title}
                  isActive={view === item.view}
                  onClick={(e) => {
                    e.preventDefault();
                    setView(item.view);
                    setIsSidebarOpen(false); // Close sidebar after selection on mobile
                  }}
                />
              ))}
            </nav>

            {/* Profile/Logout */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 p-3 text-white">
                <User className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-semibold">
                    {user?.user?.first_name || user?.username || "User"}{" "}
                    {user?.user?.last_name || user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-400">{user.agent_id}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-grow p-4 md:p-8 pt-20 md:pt-8 md:ml-64 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto py-4">{renderView()}</div>
        </main>

        {/* Shop Modal */}
        {shopModalOpen && (
          <ShopFormModal
            shop={currentShop}
            onClose={() => setShopModalOpen(false)}
            onSave={handleSaveShop}
          />
        )}


        {showInfoModal && currentShop && (
            <ShopInfoModal
                shop={currentShop}
                onClose={closeInfoModal}
                onEdit={openEditShopModal} // Passes shop data to the edit handler
            />
        )}
      </div>
      {/* 🔒 Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDashboard;
