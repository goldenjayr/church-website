# Cloudinary Setup Guide for User Profile Images

This guide will help you set up Cloudinary for free image hosting in your church website application.

## Why Cloudinary?

Cloudinary offers a generous free tier that includes:
- **25GB storage**
- **25GB bandwidth per month**
- **25,000+ transformations per month**
- Automatic image optimization
- CDN delivery
- Face-detection cropping for profile images

## Setup Instructions

### 1. Create a Free Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Fill in your details and create an account
4. Verify your email address

### 2. Get Your API Credentials

1. After logging in, go to your Dashboard
2. You'll see your Cloud credentials:
   - **Cloud Name**: This is your unique identifier
   - **API Key**: Your public API key
   - **API Secret**: Keep this secure (never commit to git!)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Never commit your `.env.local` file to version control!

### 4. Security Settings (Recommended)

1. In Cloudinary Dashboard, go to Settings > Security
2. Enable "Restricted media types" and select only image types
3. Set upload presets if you want additional security
4. Configure allowed domains for your application

## Features Implemented

### User Profile Image Upload
- Users can upload profile pictures from `/profile` page
- Images are automatically optimized for web
- Face detection ensures profile pictures are properly cropped
- Old images are automatically deleted when replaced

### Image Optimization
- All images are automatically compressed
- Served in modern formats (WebP, AVIF) when supported
- Responsive sizing based on device
- CDN delivery for fast loading worldwide

## Usage in the Application

### Uploading a Profile Image
1. Navigate to your profile page (`/profile`)
2. Click on the profile picture area or "Upload Photo" button
3. Select an image from your device
4. Click "Save Changes" to upload

### Supported Formats
- JPEG/JPG
- PNG
- GIF
- WebP

### Size Limits
- Maximum file size: 10MB (configurable)
- Images are automatically resized if too large
- Profile images are cropped to 500x500px

## Troubleshooting

### Common Issues

1. **"Failed to upload image" error**
   - Check your API credentials are correct
   - Ensure you have internet connection
   - Verify your Cloudinary account is active

2. **Images not displaying**
   - Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set correctly
   - Clear browser cache
   - Check browser console for errors

3. **Quota exceeded**
   - Monitor your usage in Cloudinary Dashboard
   - Consider upgrading if you exceed free tier limits
   - Implement image size restrictions

## Best Practices

1. **Image Optimization**
   - Always use the `getOptimizedImageUrl()` helper function
   - Specify dimensions when displaying images
   - Use lazy loading for images below the fold

2. **Security**
   - Never expose your API Secret in client-side code
   - Use environment variables for all credentials
   - Implement rate limiting for uploads

3. **User Experience**
   - Show upload progress indicators
   - Provide clear error messages
   - Allow users to preview before saving
   - Implement image cropping if needed

## API Routes

### `/api/profile`
- **GET**: Fetch user profile including image URL
- **PUT**: Update profile and upload new image
- **DELETE**: Remove profile image

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the server logs
3. Verify your Cloudinary dashboard for quota/errors
4. Check the [Cloudinary Status Page](https://status.cloudinary.com/)

## Future Enhancements

Consider implementing:
- [ ] Multiple image uploads for galleries
- [ ] Image editing (crop, rotate, filters)
- [ ] Bulk upload functionality
- [ ] Video support for sermons
- [ ] Automatic backup to alternative storage
