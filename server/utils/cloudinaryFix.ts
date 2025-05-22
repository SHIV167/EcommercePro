/**
 * Utility module to fix Cloudinary URL handling
 * 
 * This addresses the issue where local file paths are being stored
 * in the database instead of proper Cloudinary URLs
 */

import cloudinary from './cloudinary';

// Environment variable for Cloudinary cloud name
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

/**
 * Fixes image URLs stored in the database by converting local paths to Cloudinary URLs
 * 
 * @param imageUrl The URL to fix
 * @param folderName The Cloudinary folder name (e.g., 'banners', 'products')
 * @returns A proper Cloudinary URL
 */
export const fixCloudinaryUrl = (imageUrl: string, folderName: string = 'banners'): string => {
  // If already a Cloudinary URL, ensure it's HTTPS
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace('http://', 'https://');
  }
  
  // If it's a local path (starts with /uploads/), convert to Cloudinary URL
  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    // Extract filename from path
    const filename = imageUrl.split('/').pop();
    if (!filename) return imageUrl;
    
    // Construct Cloudinary URL
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${folderName}/${filename}`;
  }
  
  // Return original URL if no conversion needed
  return imageUrl;
};

/**
 * Converts file objects from multer-storage-cloudinary to proper Cloudinary URLs
 * 
 * @param file The file object from multer upload
 * @param defaultFolder The default folder name if one can't be determined
 * @returns A proper Cloudinary URL
 */
export const getCloudinaryUrlFromFile = (file: any, defaultFolder: string = 'banners'): string => {
  console.log('[CLOUDINARY_FIX] Processing file:', file.fieldname || 'unknown field');
  
  // Check for direct Cloudinary URL in various properties
  if (file.secure_url) {
    console.log('[CLOUDINARY_FIX] Found secure_url:', file.secure_url);
    return file.secure_url;
  }
  
  // Check path property which may contain Cloudinary URL
  if (file.path && file.path.includes('cloudinary.com')) {
    const secureUrl = file.path.replace('http://', 'https://');
    console.log('[CLOUDINARY_FIX] Found Cloudinary URL in path:', secureUrl);
    return secureUrl;
  }
  
  // For local files with multer-storage-cloudinary, construct URL from filename
  if (file.filename) {
    // Determine folder from fieldname or use default
    const folder = file.fieldname === 'desktopImage' || file.fieldname === 'mobileImage' 
      ? 'banners' 
      : defaultFolder;
      
    // Construct URL directly
    const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${folder}/${file.filename}`;
    console.log('[CLOUDINARY_FIX] Constructed Cloudinary URL from filename:', cloudinaryUrl);
    return cloudinaryUrl;
  }
  
  // Fallback to local path if all else fails
  if (file.destination && file.filename) {
    const localPath = `/uploads/${defaultFolder}/${file.filename}`;
    console.log('[CLOUDINARY_FIX] Fallback to local path:', localPath);
    return localPath;
  }
  
  console.log('[CLOUDINARY_FIX] Could not determine URL for file:', file);
  return '';
};

export default {
  fixCloudinaryUrl,
  getCloudinaryUrlFromFile
};
