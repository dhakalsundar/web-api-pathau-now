'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { readAuthFromCookies } from '@/lib/cookies';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  userName: string;
  userInitial: string;
  onAvatarChange?: (avatarPath: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  apiBaseUrl?: string;
}

export default function ProfilePictureUpload({
  currentAvatar,
  userName,
  userInitial,
  onAvatarChange,
  onError,
  onSuccess,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError('');

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const error = 'Only JPG, PNG, and WEBP images are allowed';
      setLocalError(error);
      onError?.(error);
      return;
    }

    // File size validation (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const error = 'Image size must be less than 2MB';
      setLocalError(error);
      onError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) {
      setLocalError('No file selected');
      onError?.('No file selected');
      return;
    }

    try {
      setUploading(true);
      setLocalError('');

      const file = fileInputRef.current.files[0];
      const { token } = readAuthFromCookies();
      if (!token) {
        const error = 'Authentication required. Please log in again.';
        setLocalError(error);
        onError?.(error);
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.put(`${apiBaseUrl}/api/auth/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.data?.avatar) {
        const avatarUrl = response.data.data.avatar;
        onAvatarChange?.(avatarUrl);
        const message = 'Profile picture updated successfully!';
        onSuccess?.(message);
        setShowPreview(false);
        setPreview(null);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      const error =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload profile picture';
      setLocalError(error);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAvatarDisplay = () => {
    if (preview && showPreview) {
      return preview;
    }
    if (currentAvatar) {
      const isHttp = currentAvatar.startsWith('http');
      let displayUrl = isHttp ? currentAvatar : `${apiBaseUrl}${currentAvatar}`;
      
      // Add cache-busting timestamp for relative URLs
      if (!isHttp) {
        displayUrl = `${displayUrl}?t=${Date.now()}`;
      }
      return displayUrl;
    }
    return null;
  };

  const avatarDisplay = getAvatarDisplay();

  return (
    <div className="space-y-6">
      {/* Avatar Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {avatarDisplay ? (
            <div key={avatarDisplay} className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 bg-gray-100 shadow-lg">
              <Image
                key={`avatar-${avatarDisplay}`}
                src={avatarDisplay}
                alt={userName || 'User avatar'}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  console.error('Image load error:', e);
                }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-amber-200 shadow-lg">
              <span className="text-5xl font-bold text-white">{userInitial}</span>
            </div>
          )}

          {/* Upload Button Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white rounded-full p-3 shadow-lg transition"
            title="Upload profile picture"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center">{userName}</p>
      </div>

      {/* Error Message */}
      {localError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-medium"> {localError}</p>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-blue-900">
             Preview your new profile picture
          </p>
          <div className="flex gap-4">
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {uploading ? ' Uploading...' : ' Confirm & Upload'}
            </button>
            <button
              onClick={cancelPreview}
              disabled={uploading}
              className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Upload Instructions */}
      {!showPreview && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-gray-900"> Accepted formats:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>JPG, PNG, or WEBP</li>
            <li>Maximum size: 2MB</li>
            <li>Square images work best</li>
          </ul>
        </div>
      )}
    </div>
  );
}
