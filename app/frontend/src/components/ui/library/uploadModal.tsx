import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { pageforgeApi } from '../../../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  uploadedId?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const mediaFiles = droppedFiles.filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (mediaFiles.length > 0) {
      const newFiles = mediaFiles.map(file => ({
        file,
        status: 'pending' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = selectedFiles.map(file => ({
        file,
        status: 'pending' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <PhotoIcon className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <VideoCameraIcon className="w-5 h-5" />;
    return <DocumentIcon className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Process files in batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (fileWithStatus, batchIndex) => {
          const globalIndex = i + batchIndex;
          try {
            // Update status to uploading
            setFiles(prev => {
              const updated = [...prev];
              updated[globalIndex] = { ...updated[globalIndex], status: 'uploading', progress: 0 };
              return updated;
            });

            // Upload the file using pageforgeApi
            const result = await pageforgeApi.uploadImagesFromFiles([fileWithStatus.file]);

            // Update status to success
            setFiles(prev => {
              const updated = [...prev];
              updated[globalIndex] = {
                ...updated[globalIndex],
                status: 'success',
                progress: 100,
                uploadedId: result[0]?.id || 'uploaded'
              };
              return updated;
            });
          } catch (error: any) {
            console.error('Upload failed:', error);
            // Update status to error
            setFiles(prev => {
              const updated = [...prev];
              updated[globalIndex] = {
                ...updated[globalIndex],
                status: 'error',
                error: error?.message || 'Upload failed'
              };
              return updated;
            });
          }
        })
      );
    }

    setIsUploading(false);

    // Check if all uploads succeeded
    const allSuccess = files.every(f => f.status === 'success');
    if (allSuccess && onUploadComplete) {
      onUploadComplete();
      // Auto-close after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      onClose();
    }
  };

  const getStatusIcon = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload Media</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${dragActive
                ? 'border-blue-400 bg-blue-900/30 scale-[1.02]'
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            <div className="space-y-3">
              <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-base font-medium text-white">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Images and videos • Multiple files supported
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                  Files ({files.length})
                </h3>
                {(successCount > 0 || errorCount > 0) && (
                  <div className="text-xs text-gray-400">
                    {successCount > 0 && <span className="text-green-400">{successCount} uploaded</span>}
                    {successCount > 0 && errorCount > 0 && <span className="mx-1">•</span>}
                    {errorCount > 0 && <span className="text-red-400">{errorCount} failed</span>}
                  </div>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {files.map((fileWithStatus, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-3 rounded-md transition-colors
                      ${fileWithStatus.status === 'error' ? 'bg-red-900/20 border border-red-700/50' :
                        fileWithStatus.status === 'success' ? 'bg-green-900/20 border border-green-700/50' :
                          'bg-gray-700'}
                    `}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(fileWithStatus.file)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {fileWithStatus.file.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-xs text-gray-400">
                            {formatFileSize(fileWithStatus.file.size)}
                          </p>
                          {fileWithStatus.error && (
                            <>
                              <span className="text-gray-500">•</span>
                              <p className="text-xs text-red-400">{fileWithStatus.error}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fileWithStatus.status)}
                        {fileWithStatus.status === 'pending' && !isUploading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {isUploading && uploadingCount > 0 && (
              <span>Uploading {uploadingCount} file{uploadingCount !== 1 ? 's' : ''}...</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : successCount > 0 ? 'Close' : 'Cancel'}
            </button>
            {pendingCount > 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isUploading
                  ? `Uploading... (${uploadingCount}/${files.length})`
                  : `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
