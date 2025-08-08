// Client-side Cloudinary helpers (no Node.js dependencies)

/**
 * Generate optimized Cloudinary URL for displaying images
 * This function can be used on both client and server side
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    gravity?: string;
    format?: string;
  }
): string {
  if (!imageUrl) return '';
  
  // If it's already a Cloudinary URL, transform it
  if (imageUrl.includes('cloudinary')) {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      // Extract the public ID (everything after upload/vXXXX/)
      const versionIndex = uploadIndex + 1;
      const publicIdParts = urlParts.slice(versionIndex + 1);
      const publicId = publicIdParts.join('/');
      
      // Build transformation string
      const transformations = [];
      
      if (options?.width) transformations.push(`w_${options.width}`);
      if (options?.height) transformations.push(`h_${options.height}`);
      if (options?.crop) transformations.push(`c_${options.crop}`);
      if (options?.quality) transformations.push(`q_${options.quality}`);
      if (options?.gravity) transformations.push(`g_${options.gravity}`);
      if (options?.format) transformations.push(`f_${options.format}`);
      
      // Default transformations if none specified
      if (transformations.length === 0) {
        transformations.push('w_300', 'h_300', 'c_fill', 'q_auto', 'f_auto');
      }
      
      const transformationString = transformations.join(',');
      
      // Build the new URL
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
    }
  }
  
  // Return original URL if not a Cloudinary URL
  return imageUrl;
}

/**
 * Build a Cloudinary URL from a public ID
 */
export function buildCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    gravity?: string;
    format?: string;
  }
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    return '';
  }
  
  // Build transformation string
  const transformations = [];
  
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.gravity) transformations.push(`g_${options.gravity}`);
  if (options?.format) transformations.push(`f_${options.format}`);
  
  // Default transformations if none specified
  if (transformations.length === 0) {
    transformations.push('w_300', 'h_300', 'c_fill', 'q_auto', 'f_auto');
  }
  
  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Extract public ID from a Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary')) {
    return null;
  }
  
  const urlParts = cloudinaryUrl.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  
  if (uploadIndex !== -1) {
    // Skip the version (vXXXX) and get the public ID
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const publicIdWithExt = publicIdParts.join('/');
    // Remove file extension
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  }
  
  return null;
}
