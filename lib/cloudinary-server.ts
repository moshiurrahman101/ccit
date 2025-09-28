import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    if (!publicId) {
      console.log('No public ID provided for deletion');
      return true; // No image to delete
    }

    console.log('Deleting image with public ID:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Image deleted successfully from Cloudinary');
      return true;
    } else if (result.result === 'not found') {
      console.log('Image not found in Cloudinary (may have been already deleted)');
      return true; // Consider this a success since the goal is achieved
    } else {
      console.error('Failed to delete image from Cloudinary:', result);
      return false;
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    // Extract public ID from URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= parts.length - 1) {
      return null;
    }

    // Get the part after 'upload' and before the last part (which is the filename)
    const publicIdWithVersion = parts[uploadIndex + 1];
    const filename = parts[parts.length - 1];
    
    // Remove version prefix if present (v1234567890)
    const publicId = publicIdWithVersion.replace(/^v\d+/, '');
    
    // Remove file extension
    const publicIdWithoutExt = filename.split('.')[0];
    
    return publicId + '/' + publicIdWithoutExt;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Delete multiple images
export const deleteImages = async (urls: string[]): Promise<boolean> => {
  try {
    const deletePromises = urls.map(url => {
      const publicId = getPublicIdFromUrl(url);
      return publicId ? deleteImage(publicId) : Promise.resolve(true);
    });

    const results = await Promise.all(deletePromises);
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    return false;
  }
};