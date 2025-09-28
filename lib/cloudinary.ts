// Client-safe upload function for Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Debug environment variables (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cloudinary Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
      console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      console.log('File type:', file.type);
      console.log('File name:', file.name);
    }
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }

    // Try client-side upload first
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add upload preset if available
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Uploading to Cloudinary (client-side)...');
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('Client-side upload successful:', data);
        }
        return data.secure_url;
      } else {
        const errorText = await response.text();
        console.warn('Client-side upload failed, trying server-side fallback:', errorText);
        throw new Error('Client-side upload failed');
      }
    } catch (clientError) {
      console.log('Client-side upload failed, using server-side fallback...');
      
      // Fallback to server-side upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Server-side upload successful:', data);
      }
      return data.url;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Re-throw the error to preserve the original message
  }
};

// Extract public ID from Cloudinary URL
export const getPublicId = (url: string): string => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};
