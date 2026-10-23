import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';

export const ImageUpload = ({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'Upload an image or paste URL',
  aspectRatio = 'square', // 'square' | 'wide'
}) => {
  const [tab, setTab] = useState('file');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('Image is too large. Maximum file size is 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      onChange(base64);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
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

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`px-2 py-0.5 rounded-md transition ${
              tab === 'file' ? 'bg-white text-brand-700 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2 py-0.5 rounded-md transition ${
              tab === 'url' ? 'bg-white text-brand-700 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Preview Card if image exists */}
      {value ? (
        <div className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
          <div
            className={`rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 ${
              aspectRatio === 'wide' ? 'w-24 h-16' : 'w-16 h-16'
            }`}
          >
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Image Selected</p>
            <p className="text-[11px] text-slate-400 truncate">
              {value.startsWith('data:') ? 'Local file uploaded (Base64)' : value}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
              >
                Change Image
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : tab === 'file' ? (
        /* Drag & Drop Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">
            Click to upload <span className="font-normal text-slate-500">or drag & drop</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP or GIF up to 4MB</p>
        </div>
      ) : (
        /* Direct URL Input */
        <div className="relative">
          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default ImageUpload;
