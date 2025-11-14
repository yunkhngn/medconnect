import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { getApiUrl } from '@/utils/api';

export const useAvatar = () => {
  const [uploading, setUploading] = useState(false);

  /**
   * Get avatar URL with priority:
   * 1. Custom uploaded avatar (from database)
   * 2. Gmail profile photo (from Firebase)
   * 3. Placeholder/default avatar
   */
  const getAvatarUrl = (user, dbAvatarUrl) => {
    // Priority 1: Custom avatar from database (Cloudinary)
    if (dbAvatarUrl) {
      return dbAvatarUrl;
    }

    // Priority 2: Gmail profile photo
    if (user?.photoURL) {
      return user.photoURL;
    }

    // Priority 3: Default placeholder
    return null;
  };

  /**
   * Upload avatar to backend (Cloudinary)
   */
  const uploadAvatar = async (file) => {
    if (!file) {
      throw new Error('No file selected');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${getApiUrl()}/avatar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const data = await response.json();
      return data.avatarUrl;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete custom avatar (revert to Gmail photo or placeholder)
   */
  const deleteAvatar = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    const response = await fetch(`${getApiUrl()}/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete avatar');
    }

    return response.json();
  };

  return {
    getAvatarUrl,
    uploadAvatar,
    deleteAvatar,
    uploading,
  };
};

