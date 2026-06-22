'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useFileUpload } from '@/shared/hooks/useFileUpload';

interface AvatarUploaderProps {
  currentUrl?: string;
  initials: string;
  onUploaded: (url: string) => void;
}

export default function AvatarUploader({ currentUrl, initials, onUploaded }: AvatarUploaderProps) {
  const { uploadFile, isUploading } = useFileUpload();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || currentUrl;

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const result = await uploadFile(file);
    URL.revokeObjectURL(objectUrl);

    if (result) {
      setPreview(result.url);
      onUploaded(result.url);
    } else {
      setPreview(null);
      setError('Upload failed — please try again');
    }
  }, [uploadFile, onUploaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar drop zone */}
      <div
        className={`relative h-24 w-24 rounded-[1.75rem] cursor-pointer transition-all duration-200 ${
          isDragging ? 'ring-2 ring-[#ccff00] scale-105' : 'hover:scale-105'
        }`}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Image or initials */}
        <div className="h-full w-full rounded-[1.75rem] bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-display font-bold text-white/30">{initials}</span>
          )}
        </div>

        {/* Hover / dragging overlay */}
        {!isUploading && (
          <div className={`absolute inset-0 rounded-[1.75rem] flex flex-col items-center justify-center transition-opacity duration-200 bg-black/60 ${
            isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
          }`}>
            <span className="material-symbols-outlined text-[#ccff00] text-[28px]">photo_camera</span>
            <span className="text-[10px] text-white font-bold mt-1 tracking-widest uppercase">
              {isDragging ? 'Drop here' : 'Change'}
            </span>
          </div>
        )}

        {/* Upload spinner overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-[1.75rem] flex items-center justify-center bg-black/70">
            <span className="material-symbols-outlined text-[#ccff00] text-[28px] animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {/* Verified badge */}
        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#ccff00] rounded-full border-2 border-[#0f111a] flex items-center justify-center">
          <span className="material-symbols-outlined text-black text-[12px] font-bold">verified</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <p className="text-[10px] text-white/30 text-center leading-relaxed">
        {isUploading ? 'Uploading…' : 'Click or drag & drop\nto change photo'}
      </p>

      {error && (
        <p className="text-[10px] text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
