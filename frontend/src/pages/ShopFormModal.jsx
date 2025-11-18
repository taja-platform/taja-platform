// import React, { useState, useMemo } from "react";
// // Assuming you have imported your icons (XIcon, MapPin, CheckCircle)
// // If you are using lucide-react, you'll need these for the image section:
// import { X, Upload, Trash2 } from "lucide-react";

// // --- CONSTANTS (Define your image limit) ---
// const MAX_PHOTOS = 5;

// // Mock components and data (replace with your actual imports)
// const Input = ({ label, ...props }) => (
//   <div className="space-y-1">
//     <label className="block text-sm font-medium text-gray-700">{label}</label>
//     <input
//       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//       {...props}
//     />
//   </div>
// );
// const Select = ({ label, options, ...props }) => (
//   <div className="space-y-1">
//     <label className="block text-sm font-medium text-gray-700">{label}</label>
//     <select
//       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//       {...props}
//     >
//       <option value="">Select...</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//   </div>
// );
// const toast = {
//   success: (msg) => console.log(`TOAST SUCCESS: ${msg}`),
//   error: (msg) => console.log(`TOAST ERROR: ${msg}`),
// };
// const mockToast = { info: (msg) => console.log(`MOCK INFO: ${msg}`) };
// const XIcon = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M18 6L6 18M6 6l12 12" />
//   </svg>
// );
// const MapPin = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
//     <circle cx="12" cy="9" r="3" />
//   </svg>
// );
// const CheckCircle = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//     <path d="M22 4L12 14.01l-3-3" />
//   </svg>
// );

// // Mock map and states (replace with your actual data)
// const STATE_LGA_MAP = {
//   Lagos: ["Ikeja", "Lekki"],
//   Abuja: ["Gwarinpa", "Wuse"],
// };
// const STATES = Object.keys(STATE_LGA_MAP);

// const ShopFormModal = ({ shop, onClose, onSave }) => {
//   const isEditing = !!shop?.id;

//   // --- UPDATED STATE FOR IMAGE MANAGEMENT ---
//   // 1. Existing shop data (name, address, etc.)
//   const [formData, setFormData] = useState(
//     shop || {
//       name: "",
//       phone_number: "",
//       address: "",
//       state: "",
//       local_government_area: "",
//       latitude: null,
//       longitude: null,
//       description: "", // Added description for completeness
//     }
//   );
//   // 2. Existing photos returned by the API (filtered by deletion status)
//   const [existingPhotos, setExistingPhotos] = useState(shop?.photos || []);
//   // 3. New files selected for upload
//   const [newFiles, setNewFiles] = useState([]);
//   // 4. IDs of photos to be deleted on submission
//   const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [imageError, setImageError] = useState(null);

//   // Get LGAs based on the currently selected state
//   const lgaOptions = STATE_LGA_MAP[formData.state] || [];

//   // --- COMPUTED VALUES FOR LIMIT CHECKING ---
//   const totalCurrentPhotos = useMemo(() => {
//     // Total photos in the database (original count) - those marked for deletion
//     const photosToKeep = (shop?.photos?.length || 0) - deletedPhotoIds.length;
//     // The final count will be photos to keep + new files to add
//     return photosToKeep + newFiles.length;
//   }, [deletedPhotoIds, newFiles, shop]);

//   const canAddMorePhotos = totalCurrentPhotos < MAX_PHOTOS;

//   // --- HANDLERS ---

//   const handleRemoveExisting = (photoId) => {
//     // 1. Remove from the visible list
//     setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
//     // 2. Add to the list to be deleted on submit
//     setDeletedPhotoIds((prev) => [...prev, photoId]);
//   };

//   const handleRemoveNewFile = (index) => {
//     setNewFiles((prev) => prev.filter((_, i) => i !== index));
//     setImageError(null);
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     const slotsAvailable = MAX_PHOTOS - totalCurrentPhotos;

//     if (files.length > slotsAvailable) {
//       setImageError(
//         `You can only add ${slotsAvailable} more photo(s). The limit is ${MAX_PHOTOS}.`
//       );
//       // Clear the input value so the same files can be selected again
//       e.target.value = null;
//       return;
//     }

//     setImageError(null);
//     setNewFiles((prev) => [...prev, ...files]);
//     // Clear the input value
//     e.target.value = null;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       if (name === "state") {
//         return {
//           ...prev,
//           state: value,
//           local_government_area: "", // Reset LGA when state changes
//         };
//       }
//       return { ...prev, [name]: value };
//     });
//   };

//   const handleLocationPin = (lat, lng) => {
//     setFormData((prev) => ({
//       ...prev,
//       latitude: lat,
//       longitude: lng,
//     }));
//     mockToast.info(`Location Pinned: Lat ${lat}, Lng ${lng}`);
//   };

//   const useCurrentLocation = () => {
//     // ... (Geolocation logic remains the same)
//     setIsLoading(true);
//     mockToast.info("Requesting current location...");
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           handleLocationPin(
//             position.coords.latitude.toFixed(6),
//             position.coords.longitude.toFixed(6)
//           );
//           setIsLoading(false);
//         },
//         (error) => {
//           toast.error(
//             "Could not get location. Ensure permissions are granted."
//           );
//           console.error("Geolocation error:", error);
//           setIsLoading(false);
//         },
//         { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//       );
//     } else {
//       toast.error("Geolocation is not supported by this browser.");
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // --- VALIDATION ---
//     if (!formData.state) {
//       toast.error("Please select a State/Region.");
//       return;
//     }
//     if (!formData.local_government_area) {
//       toast.error("Please select a Local Government Area.");
//       return;
//     }
//     if (!formData.latitude || !formData.longitude) {
//       toast.error("Please pin the shop's location.");
//       return;
//     }

//     // --- API PAYLOAD CONSTRUCTION (CRUCIAL FOR EDITING) ---
//     const data = new FormData();

//     // 1. Append all standard form fields
//     Object.keys(formData).forEach((key) => {
//       // Exclude nested objects or arrays if any, only append primitive values
//       const value = formData[key];
//       if (value !== null && value !== undefined && typeof value !== "object") {
//         data.append(key, value);
//       }
//     });

//     // 2. Append photos to be deleted (used by the DRF serializer)
//     if (isEditing && deletedPhotoIds.length > 0) {
//       // DRF ListFields in FormData often require JSON string
//       data.append("photos_to_delete_ids", JSON.stringify(deletedPhotoIds));
//     }

//     // 3. Append new photo files (used by the DRF serializer)
//     newFiles.forEach((file) => {
//       data.append("uploaded_photos", file); // 'uploaded_photos' MUST match the serializer field
//     });

//     setIsLoading(true);
//     // Call the parent onSave function with the prepared FormData payload
//     onSave(data);

//     // NOTE: Remove the mock setTimeout block below once you implement the real API call in onSave.
//     setTimeout(() => {
//       toast.success(`Shop ${isEditing ? "updated" : "added"} successfully!`);
//       setIsLoading(false);
//       onClose(); // Close on success
//     }, 1000);
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">
//             {isEditing ? "Edit Shop" : "Add New Shop"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <XIcon className="w-6 h-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Basic Info */}
//           <Input
//             id="name"
//             name="name"
//             label="Shop Name"
//             type="text"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//           <Input
//             id="phone_number"
//             name="phone_number"
//             label="Phone Number"
//             type="tel"
//             value={formData.phone_number}
//             onChange={handleChange}
//           />
//           <Input
//             id="address"
//             name="address"
//             label="Full Address"
//             type="text"
//             value={formData.address}
//             onChange={handleChange}
//             required
//           />
//           <Input
//             id="description"
//             name="description"
//             label="Description"
//             type="text"
//             value={formData.description}
//             onChange={handleChange}
//           />

//           {/* State/LGA Selection */}
//           <Select
//             id="state"
//             name="state"
//             label="State/Region"
//             value={formData.state}
//             onChange={handleChange}
//             options={STATES}
//             required
//           />
//           <Select
//             id="local_government_area"
//             name="local_government_area"
//             label="Local Government Area"
//             value={formData.local_government_area}
//             onChange={handleChange}
//             options={lgaOptions}
//             required
//             disabled={!formData.state || lgaOptions.length === 0}
//           />

//           {/* --- UPDATED: Photo Display and Upload Section --- */}
//           <div className="pt-3 border-t border-gray-100">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Shop Photos (
//               <span className="font-semibold text-blue-600">
//                 {totalCurrentPhotos}
//               </span>{" "}
//               / {MAX_PHOTOS} used)
//             </label>

//             {/* Photo Display Grid */}
//             <div className="flex flex-wrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-24">
//               {/* 1. Existing Photos (Kept) */}
//               {existingPhotos.map((photo) => (
//                 <div
//                   key={photo.id}
//                   className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-transparent hover:border-red-500 transition-colors"
//                 >
//                   {/* Use the photo URL from the API response */}
//                   <img
//                     src={photo.photo}
//                     alt={`Shop Photo ${photo.id}`}
//                     className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-75"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveExisting(photo.id)}
//                     className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 opacity-90 transition-opacity duration-200 shadow-lg hover:bg-red-600 hover:text-white"
//                     title="Mark for Deletion"
//                   >
//                     <Trash2 size={16} /> {/* Icon for trash/remove */}
//                   </button>
//                 </div>
//               ))}

//               {/* 2. Newly Added Files (Preview) */}
//               {newFiles.map((file, index) => (
//                 <div
//                   key={index}
//                   className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group border-2 border-green-500"
//                 >
//                   <img
//                     src={URL.createObjectURL(file)}
//                     alt={file.name}
//                     className="w-full h-full object-cover"
//                     onLoad={(e) => URL.revokeObjectURL(e.target.src)}
//                   />
//                   <span className="absolute bottom-0 left-0 right-0 text-xs text-center bg-green-500 text-white truncate px-1 font-semibold">
//                     NEW
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveNewFile(index)}
//                     className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 transition-colors hover:bg-red-700"
//                     title="Remove New File"
//                   >
//                     <X size={16} /> {/* Icon for close/remove */}
//                   </button>
//                 </div>
//               ))}

//               {/* 3. Add Image Button (Visible only if limit is not reached) */}
//               {canAddMorePhotos && (
//                 <label
//                   htmlFor="photo-upload"
//                   className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors"
//                 >
//                   <Upload size={24} />
//                   <span className="text-xs mt-1">Add Photo</span>
//                   <input
//                     id="photo-upload"
//                     type="file"
//                     accept="image/jpeg,image/png"
//                     multiple
//                     onChange={handleImageChange}
//                     className="hidden"
//                     disabled={!canAddMorePhotos || isLoading}
//                   />
//                 </label>
//               )}

//               {/* Empty state or limit reached message */}
//               {totalCurrentPhotos === 0 && (
//                 <p className="text-gray-500 text-sm italic py-8">
//                   No photos loaded. Click "Add Photo" to begin!
//                 </p>
//               )}
//             </div>

//             {imageError && (
//               <p className="mt-2 text-sm font-medium text-red-600 flex items-center">
//                 <X size={16} className="mr-1" />
//                 {imageError}
//               </p>
//             )}
//             <p className="mt-2 text-xs text-gray-500">
//               Maximum **{MAX_PHOTOS}** photos allowed.
//             </p>
//           </div>
//           {/* --- END UPDATED PHOTO SECTION --- */}

//           {/* Location Coordinates Section (Remains the same) */}
//           <div className="pt-3 border-t border-gray-100">
//             <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
//               <MapPin className="w-5 h-5 mr-2 text-gray-900" /> Location
//               Coordinates
//             </h3>

//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <Input
//                 id="latitude"
//                 name="latitude"
//                 label="Latitude"
//                 type="number"
//                 step="0.000001"
//                 value={formData.latitude || ""}
//                 onChange={handleChange}
//                 readOnly={isLoading}
//                 required
//               />
//               <Input
//                 id="longitude"
//                 name="longitude"
//                 label="Longitude"
//                 type="number"
//                 step="0.000001"
//                 value={formData.longitude || ""}
//                 onChange={handleChange}
//                 readOnly={isLoading}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <button
//                 type="button"
//                 onClick={useCurrentLocation}
//                 disabled={isLoading}
//                 className="w-full py-3 flex items-center justify-center bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
//               >
//                 <CheckCircle className="w-5 h-5 mr-2" />
//                 {isLoading ? "Locating..." : "Use Current Location"}
//               </button>

//               <div className="text-center text-sm text-gray-500 py-2">
//                 - OR -
//               </div>

//               {/* Simulated Map */}
//               <div
//                 className="h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer text-gray-500 hover:bg-gray-200 transition-colors"
//                 onClick={() =>
//                   handleLocationPin(
//                     34.053 + (Math.random() * 0.01).toFixed(4),
//                     -118.243 - (Math.random() * 0.01).toFixed(4)
//                   )
//                 }
//               >
//                 <p className="text-center">
//                   Click here to simulate selecting a new location from a map.
//                   <br />
//                   (Lat/Lng will be auto-filled)
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Submit Button (Remains the same) */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full h-12 mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center space-x-3">
//                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 <span>Saving...</span>
//               </div>
//             ) : (
//               <span>{isEditing ? "Update Shop" : "Add Shop"}</span>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ShopFormModal;
