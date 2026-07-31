import React from 'react';
import {
  ArrowUpTrayIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { ReferenceImageState } from '../../../../types/videoGeneration.types';
import { referenceTypeOptions } from '../constants';
import { fileToBase64, createVertexVideoAssetFromFile } from '../../../../api/videoGeneration.api';
import { MediaUrlPicker } from '../../library';

type MediaInputsProps = {
  image: File | null;
  imagePreview: string | null;
  lastFrame: File | null;
  lastFramePreview: string | null;
  videoInput: File | null;
  videoPreview: string | null;
  referenceImages: ReferenceImageState[];
  onImageSelect: (file: File) => void;
  onLastFrameSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onReferenceImagesAdd: (files: File[]) => void;
  onClearImage: () => void;
  onClearLastFrame: () => void;
  onClearVideo: () => void;
  onRemoveReferenceImage: (id: string) => void;
  onUpdateReferenceType: (id: string, referenceType: 'asset' | 'style') => void;
  encodeVideo: boolean;
  setEncodeVideo: (value: boolean) => void;
  encodedVideoSizeKB: number | null;
  setEncodedVideoSizeKB: (value: number | null) => void;
  isEncodingVideo: boolean;
  setIsEncodingVideo: (value: boolean) => void;
};

export const MediaInputsSection: React.FC<MediaInputsProps> = ({
  image,
  imagePreview,
  lastFrame,
  lastFramePreview,
  videoInput,
  videoPreview,
  referenceImages,
  onImageSelect,
  onLastFrameSelect,
  onVideoSelect,
  onReferenceImagesAdd,
  onClearImage,
  onClearLastFrame,
  onClearVideo,
  onRemoveReferenceImage,
  onUpdateReferenceType,
  encodeVideo,
  setEncodeVideo,
  encodedVideoSizeKB,
  setEncodedVideoSizeKB,
  isEncodingVideo,
  setIsEncodingVideo,
}) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const lastFrameInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const referenceImagesInputRef = React.useRef<HTMLInputElement>(null);
  const imageDropZoneRef = React.useRef<HTMLDivElement>(null);

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) onImageSelect(file);
  };

  const handleLastFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLastFrameSelect(file);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onVideoSelect(file);
  };

  const handleReferenceImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) onReferenceImagesAdd(Array.from(files));
  };

  const handleCloudflareImageSelect = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'cloudflare-image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      onImageSelect(file);
    } catch (err) {
      console.error('Failed to fetch image from Cloudflare:', err);
      alert('Failed to load image from Cloudflare');
    }
  };

  const handleCloudflareVideoSelect = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'cloudflare-video.mp4';
      const file = new File([blob], fileName, { type: blob.type });
      onVideoSelect(file);
    } catch (err) {
      console.error('Failed to fetch video from Cloudflare:', err);
      alert('Failed to load video from Cloudflare');
    }
  };

  const handleCloudflareReferenceImageSelect = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'cloudflare-reference.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      onReferenceImagesAdd([file]);
    } catch (err) {
      console.error('Failed to fetch reference image from Cloudflare:', err);
      alert('Failed to load reference image from Cloudflare');
    }
  };

  const handleCloudflareLastFrameSelect = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'cloudflare-lastframe.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      onLastFrameSelect(file);
    } catch (err) {
      console.error('Failed to fetch last frame from Cloudflare:', err);
      alert('Failed to load last frame from Cloudflare');
    }
  };

  React.useEffect(() => {
    if (videoInput && encodeVideo) {
      const encodeVideoAsync = async () => {
        try {
          setIsEncodingVideo(true);
          const b64 = await fileToBase64(videoInput);
          const sizeKB = Math.round((b64.length * 3) / 4 / 1024);
          setEncodedVideoSizeKB(sizeKB);
        } catch (err) {
          console.error('Error encoding video:', err);
          setEncodedVideoSizeKB(null);
        } finally {
          setIsEncodingVideo(false);
        }
      };
      void encodeVideoAsync();
    } else {
      setEncodedVideoSizeKB(null);
    }
  }, [videoInput, encodeVideo, setEncodedVideoSizeKB, setIsEncodingVideo]);

  const handleDownloadEncodedVideo = async () => {
    if (!videoInput) return;
    try {
      const asset = await createVertexVideoAssetFromFile(videoInput);
      const blob = new Blob([JSON.stringify(asset, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vertex-video-asset-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create asset file', err);
      alert('Failed to create asset file');
    }
  };

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Media Inputs (Optional)</h3>
        <p className="mt-1 text-sm text-gray-400">
          Use image, video, or reference assets to guide Vertex AI Veo generation.
        </p>
      </div>

      <div className="space-y-6">
        {/* Image Guide */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-200">Image Guide</h4>
            {image && (
              <button
                onClick={onClearImage}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <XMarkIcon className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Local Upload
            </button>
            <div className="flex flex-1">
              <MediaUrlPicker
                label="Cloudflare"
                size="md"
                mediaType="images"
                onPick={handleCloudflareImageSelect}
                className="w-full justify-center"
              />
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageInputChange}
            className="hidden"
          />

          <div
            ref={imageDropZoneRef}
            onDragOver={handleImageDragOver}
            onDrop={handleImageDrop}
            onClick={() => imageInputRef.current?.click()}
            className="rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 p-8 text-center transition-colors hover:border-blue-500 cursor-pointer"
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Image guide preview" className="mx-auto max-h-64 rounded" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearImage();
                  }}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <PhotoIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
                <p className="mb-2 text-gray-300">Drop an image here or click to upload</p>
                <p className="text-sm text-gray-400">JPG, PNG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Frame */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-200">Last Frame</h4>
            {lastFrame && (
              <button
                onClick={onClearLastFrame}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <XMarkIcon className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
          <p className="mb-3 text-xs text-gray-400">
            Provide the first frame of an existing video to blend transitions.
          </p>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => lastFrameInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Local Upload
            </button>
            <div className="flex flex-1">
              <MediaUrlPicker
                label="Cloudflare"
                size="md"
                mediaType="images"
                onPick={handleCloudflareLastFrameSelect}
                className="w-full justify-center"
              />
            </div>
          </div>

          <input
            ref={lastFrameInputRef}
            type="file"
            accept="image/*"
            onChange={handleLastFrameChange}
            className="hidden"
          />
          <div className="mt-4">
            {lastFramePreview ? (
              <img
                src={lastFramePreview}
                alt="Last frame preview"
                className="h-full w-full max-h-48 rounded object-contain"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-gray-500">
                No last frame provided.
              </div>
            )}
          </div>
        </div>

        {/* Existing Video Clip */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-200">Existing Video Clip</h4>
            {videoInput && (
              <button
                onClick={onClearVideo}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <XMarkIcon className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
          <p className="mb-3 text-xs text-gray-400">
            Upload a clip to extend or transform. Veo expects MOV or MP4 formats.
          </p>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Local Upload
            </button>
            <div className="flex flex-1">
              <MediaUrlPicker
                label="Cloudflare"
                size="md"
                mediaType="videos"
                onPick={handleCloudflareVideoSelect}
                className="w-full justify-center"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs text-gray-400">Encode video for Vertex (base64)</label>
            <input
              type="checkbox"
              checked={encodeVideo}
              onChange={(e) => setEncodeVideo(e.target.checked)}
              className="accent-blue-500"
            />
            {isEncodingVideo && <span className="text-xs text-gray-400">Encoding...</span>}
            {encodedVideoSizeKB !== null && (
              <button
                onClick={handleDownloadEncodedVideo}
                className="rounded bg-gray-700 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-600"
              >
                Download Encoded JSON ({encodedVideoSizeKB} KB)
              </button>
            )}
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
          <div className="mt-4">
            {videoPreview ? (
              <video src={videoPreview} controls className="w-full rounded" />
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-gray-500">
                <VideoCameraIcon className="h-8 w-8 text-gray-600" />
                No source video uploaded.
              </div>
            )}
          </div>
        </div>

        {/* Reference Images */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-200">Reference Images</h4>
            <span className="text-xs text-gray-400">Up to 3 images</span>
          </div>

          {referenceImages.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {referenceImages.map((ref) => (
                <div key={ref.id} className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 sm:w-48">
                  <div className="relative mb-3">
                    <img src={ref.preview} alt="Reference" className="h-32 w-full rounded object-cover" />
                    <button
                      onClick={() => onRemoveReferenceImage(ref.id)}
                      className="absolute right-2 top-2 rounded bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">Reference Type</label>
                  <select
                    value={ref.referenceType}
                    onChange={(e) => onUpdateReferenceType(ref.id, e.target.value as 'asset' | 'style')}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {referenceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => referenceImagesInputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 disabled:opacity-50"
              disabled={referenceImages.length >= 3}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Local Upload
            </button>
            <div className="flex flex-1">
              <MediaUrlPicker
                label="Cloudflare"
                size="md"
                mediaType="images"
                onPick={handleCloudflareReferenceImageSelect}
                className="w-full justify-center disabled:opacity-50"
              />
            </div>
          </div>
          <input
            ref={referenceImagesInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleReferenceImagesChange}
            className="hidden"
          />
        </div>
      </div>
    </section>
  );
};
