import { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, AlertCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { tilesApi } from '../../api/tiles';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

export default function ImageUploader({ onUploadSuccess, currentUrl, themeColor = '#7C3AED' }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload a PNG, JPG, JPEG, WEBP, or GIF.');
      return false;
    }

    if (file.size > maxSizeBytes) {
      setErrorMsg('File is too large. Maximum size allowed is 10MB.');
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMsg('');

    // Generate local instant preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await tilesApi.upload(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      const uploadedUrl = response.data.data.imageUrl;
      setPreviewUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
      toast.success('Image processed successfully! 📸');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload image. Please try again.');
      setPreviewUrl('');
      toast.error('Image processing failed');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput) return;
    
    // Quick regex validation for generic image URL check / absolute url check
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setErrorMsg('Invalid URL. Make sure it starts with HTTP or HTTPS.');
      return;
    }

    setErrorMsg('');
    setPreviewUrl(urlInput);
    onUploadSuccess(urlInput);
    toast.success('Pasted URL applied successfully!');
  };

  const clearPreview = () => {
    setPreviewUrl('');
    setUrlInput('');
    onUploadSuccess('');
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => { setActiveTab('upload'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 shadow text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" /> Local Image
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('url'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'url'
              ? 'bg-white dark:bg-slate-900 shadow text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Paste Image URL
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Preview Area */}
      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-[3/2] flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Upload Preview"
            className="w-full h-full object-cover max-h-[300px]"
            onError={() => {
              setErrorMsg('Failed to render preview. Please verify URL endpoint.');
              clearPreview();
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={clearPreview}
              className="bg-red-600 text-white p-3 rounded-full hover:scale-110 active:scale-95 transition-transform"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Uploader Box */}
          {activeTab === 'upload' && (
            <div
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                flex flex-col items-center justify-center gap-3 select-none min-h-[200px]
                ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                    : 'border-slate-350 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                  <p className="text-sm font-semibold text-slate-750 dark:text-slate-300">
                    Uploading image ({uploadProgress ?? 0}%)
                  </p>
                  {uploadProgress !== null && (
                    <div className="w-48 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div
                    className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-transform group-hover:scale-110"
                    style={{ color: themeColor }}
                  >
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drag & drop image here or click to browse
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, JPEG, WEBP or GIF up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Paste URL Box */}
          {activeTab === 'url' && (
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pasted Image URL</p>
                  <p className="text-xs text-slate-400 mt-0.5">Use public image URLs</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input flex-1"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Button type="button" onClick={handleApplyUrl} disabled={!urlInput} size="md">
                  Apply
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
