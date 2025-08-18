import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image upload utility function
export const uploadImage = async (file: File, type: string = 'reviews'): Promise<{ success: boolean; imagePath?: string; error?: string }> => {
  try {
    // File validation
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size too large (max 5MB)' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP allowed' };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    // Upload to server
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, imagePath: result.imagePath };
    } else {
      return { success: false, error: result.error || 'Upload failed' };
    }
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed. Please try again.' };
  }
};