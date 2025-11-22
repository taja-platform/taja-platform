// src/utils/imageUtils.js

export const getOptimizedUrl = (url, width = 600) => {
  // 1. If it's not a Cloudinary URL or is empty, return as is
  if (!url || !url.includes('cloudinary.com')) return url;

  // 2. Split the URL at the "/upload/" segment
  const parts = url.split('/upload/');
  
  // Safety check: if the split didn't work as expected, return original
  if (parts.length < 2) return url;

  // 3. Construct the transformation string
  // w_${width}: Resize to the requested width (e.g., 500px)
  // f_auto: Serve WebP/AVIF automatically (much smaller files)
  // q_auto: Optimize quality (removes invisible data to save size)
  // c_limit: Ensures we don't stretch small images
  const transformation = `w_${width},c_limit,f_auto,q_auto`;

  // 4. Reassemble the URL
  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};