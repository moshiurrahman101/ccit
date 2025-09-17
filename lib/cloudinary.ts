// Client-safe upload function for Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Debug environment variables (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cloudinary Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
      console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    }
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Try different preset options - if none work, we'll use signed upload
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Upload URL:', uploadUrl);
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Upload successful:', data);
    }
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

// Extract public ID from Cloudinary URL
export const getPublicId = (url: string): string => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};
