import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { uploadService } from '../../services/api';

export const ImageUpload = ({
  value = '',
  onChange,
  label = 'Image',
  aspectRatio = 'square', // 'square' | 'wide'
  folder = 'bizmind/uploads',
}) => {
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFile = async (file) => {
    setError('');
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Maximum file size is 5MB.');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadService.uploadImage(file, folder);
      if (res && res.url) {
        onChange(res.url);
      } else {
        setError('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input always mounted in the DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading}
      />

      <label className="block text-xs font-semibold text-slate-700">{label}</label>

      {/* Preview Card if image exists */}
      {value ? (
        <div className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
          <div
            className={`relative rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 ${
              aspectRatio === 'wide' ? 'w-24 h-16' : 'w-16 h-16'
            }`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800">
                {uploading ? 'Updating Image...' : 'Uploaded Image'}
              </span>
              {!uploading && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={uploading}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Change Image'}
              </button>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition"
                title="View full resolution image"
              >
                View Original
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && triggerFilePicker()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/60'
          } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          {uploading ? (
            <div className="py-2">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Uploading image to cloud...</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Please wait a moment</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click to upload <span className="font-normal text-slate-500">or drag & drop</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP or GIF up to 5MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default ImageUpload;
