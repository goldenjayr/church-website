import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getCurrentUser } from '@/lib/auth-actions';
import { uploadProfileImage, deleteImage } from '@/lib/cloudinary';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return user profile data (excluding password)
    const { password, ...userProfile } = user;
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      bio,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      dateOfBirth,
      occupation,
      church,
      memberSince,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      website,
      preferredContact,
      emailNotifications,
      smsNotifications,
      profileImage // This will be a base64 string if a new image is uploaded
    } = body;

    let profileImageUrl = user.profileImage;

    // Handle image upload if provided
    if (profileImage && profileImage.startsWith('data:')) {
      try {
        // Delete old image if exists
        if (user.profileImage && user.profileImage.includes('cloudinary')) {
          // Extract public_id from URL
          const urlParts = user.profileImage.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExt.split('.')[0];
          const folder = urlParts.slice(-3, -1).join('/');
          
          try {
            await deleteImage(`${folder}/${publicId}`);
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // Continue even if delete fails
          }
        }

        // Upload new image
        const uploadResult = await uploadProfileImage(profileImage, user.id);
        profileImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        occupation,
        church,
        memberSince: memberSince ? new Date(memberSince) : null,
        facebookUrl,
        twitterUrl,
        instagramUrl,
        linkedinUrl,
        website,
        preferredContact,
        emailNotifications,
        smsNotifications,
        profileImage: profileImageUrl
      }
    });

    // Return updated profile (excluding password)
    const { password, ...userProfile } = updatedUser;
    
    return NextResponse.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Delete profile image
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      // Extract public_id from URL
      const urlParts = user.profileImage.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split('.')[0];
      const folder = urlParts.slice(-3, -1).join('/');
      
      try {
        await deleteImage(`${folder}/${publicId}`);
      } catch (deleteError) {
        console.error('Failed to delete image:', deleteError);
      }
    }

    // Remove profile image from database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully'
    });
  } catch (error) {
    console.error('Profile image delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile image' },
      { status: 500 }
    );
  }
}
