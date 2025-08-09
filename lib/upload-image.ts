"use server"

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(base64Image: string, folder: string = 'user-blogs') {
  try {
    // Upload image to Cloudinary with balanced quality settings
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // Higher resolution limit
        { quality: 'auto:good' }, // Good quality for better visuals
        { fetch_format: 'auto' }, // Auto-select best format (WebP, AVIF for modern browsers)
        { flags: 'progressive' }, // Progressive loading for better UX
        { dpr: 'auto' } // Auto-adjust for device pixel ratio
      ]
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    return {
      success: false,
      error: 'Failed to upload image'
    }
  }
}

export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    return { success: false }
  }
}
