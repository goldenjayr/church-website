// Only import cloudinary on the server side
let cloudinary: any;

if (typeof window === 'undefined') {
  const { v2 } = require('cloudinary');
  cloudinary = v2;
  
  // Configure Cloudinary with your credentials
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export interface UploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

// Server-side upload function
export async function uploadImage(
  file: string, // base64 string or URL
  folder: string = 'user-profiles'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format selection
      ]
    });
    
    return result as UploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

// Upload profile image with face detection and auto-crop
export async function uploadProfileImage(
  file: string,
  userId: string
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `user-profiles/${userId}`,
      public_id: `profile-${Date.now()}`,
      overwrite: true,
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Face-aware cropping
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result as UploadResult;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw new Error('Failed to upload profile image');
  }
}

// Delete an image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

export default cloudinary;
