import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { MediaItem } from '../../../types/ui.types';
import { AdjustmentsHorizontalIcon, ArrowPathIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import pageforgeApi from '../../../api';
import Hls from 'hls.js';
import { InlineImageCropper } from './inlineImageCropper';
import { FileNameDialog } from './fileNameDialog';

type CurveValues = { shadows: number; midtones: number; highlights: number };

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Build a simple 256-value LUT by linearly interpolating through three control points
// p0=(0, y0), p1=(0.5, y1), p2=(1, y2), where yi = clamp(xi + delta)
function buildCurveLUT({ shadows, midtones, highlights }: CurveValues): number[] {
  // map slider range [-100, 100] to [-0.4, 0.4] adjustment
  const scale = (v: number) => (v / 100) * 0.4;
  const y0 = clamp01(0 + scale(shadows));
  const y1 = clamp01(0.5 + scale(midtones));
  const y2 = clamp01(1 + scale(highlights));

  const lut: number[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    let y: number;
    if (x <= 0.5) {
      const t = x / 0.5; // 0..1
      y = lerp(y0, y1, t);
    } else {
      const t = (x - 0.5) / 0.5;
      y = lerp(y1, y2, t);
    }
    lut[i] = clamp01(y);
  }
  return lut;
}

function tableValuesFromLUT(lut: number[]) {
  // feComponentTransfer expects values 0..1 space separated
  return lut.map(v => v.toFixed(4)).join(' ');
}

interface ImageEditorProps {
  selectedItem?: MediaItem | null;
  onChanged?: () => void; // notify parent to refresh library
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ selectedItem, onChanged }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);

  const [curvesEnabled, setCurvesEnabled] = useState(true);
  const [curves, setCurves] = useState<CurveValues>({ shadows: 0, midtones: 0, highlights: 0 });
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [showFileNameDialog, setShowFileNameDialog] = useState(false);
  const [pendingExport, setPendingExport] = useState<{ blob: Blob; suggestedName: string } | null>(null);

  const filterId = useId().replace(/:/g, '_');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setCurvesEnabled(!selectedItem || selectedItem.type === 'image');
    setCurves({ shadows: 0, midtones: 0, highlights: 0 });
    setCroppedImageUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });

  }, [selectedItem?.id]);

  // Initialize HLS player for videos when needed
  useEffect(() => {
    if (!selectedItem || selectedItem.type !== 'video') return;
    const url = selectedItem.url || '';
    const isHls = /\.m3u8(\?|$)/.test(url);

    if (!videoRef.current) return;

    // Clean up any previous instance
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch { /* ignore */ }
      hlsRef.current = null;
    }

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        try {
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
        } catch (e) {
          console.warn('HLS setup failed, falling back to native tag:', e);
          if (videoRef.current) {
            videoRef.current.src = url;
          }
        }
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari supports HLS natively
        videoRef.current.src = url;
      } else {
        // Fallback: try direct assignment
        videoRef.current.src = url;
      }
    } else {
      // Non-HLS sources (e.g., mp4)
      videoRef.current.src = url;
    }

    return () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch { /* ignore */ }
        hlsRef.current = null;
      }
    };
  }, [selectedItem]);

  const lut = useMemo(() => buildCurveLUT(curves), [curves]);
  const tableValues = useMemo(() => tableValuesFromLUT(lut), [lut]);

  const cssFilter = useMemo(() => {
    const parts: string[] = [];
    // Only apply SVG curve filter to images; videos keep CSS filters only for performance/compat
    if (curvesEnabled && selectedItem?.type === 'image') parts.push(`url(#${filterId})`);
    parts.push(
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `grayscale(${grayscale}%)`
    );
    return parts.join(' ');
  }, [brightness, contrast, saturation, grayscale, curvesEnabled, filterId, selectedItem?.type]);

  const onReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setCurves({ shadows: 0, midtones: 0, highlights: 0 });
    setCroppedImageUrl(null);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create URL for the cropped image to use in preview
    const url = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(url);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
  };

  // Export the adjusted media as a Blob. Images are rendered to a canvas; videos export a snapshot frame.
  const exportAdjustedBlob = async (): Promise<{ blob: Blob; suggestedName: string; kind: 'image' | 'snapshot' } | null> => {
    if (!selectedItem) return null;
    const suggestedBase = (selectedItem.filename || selectedItem.name || 'media').replace(/\s+/g, '_');
    if (selectedItem.type === 'image') {
      // Load original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = croppedImageUrl || selectedItem.url;
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = (e) => reject(e); });
      const maxW = 4096, maxH = 4096; // safety bounds
      const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      const w = Math.max(1, Math.floor(img.naturalWidth * scale));
      const h = Math.max(1, Math.floor(img.naturalHeight * scale));

      // Source canvas to apply LUT (curves) if enabled
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = w; srcCanvas.height = h;
      const sctx = srcCanvas.getContext('2d');
      if (!sctx) return null;
      sctx.drawImage(img, 0, 0, w, h);

      if (curvesEnabled) {
        // Apply the same LUT to R,G,B channels
        const data = sctx.getImageData(0, 0, w, h);
        const arr = data.data;
        // Build LUT from current curves
        const lut = buildCurveLUT(curves);
        for (let i = 0; i < arr.length; i += 4) {
          // 0..255 -> 0..1 lookup then back to 0..255
          arr[i] = Math.max(0, Math.min(255, Math.round(lut[arr[i]] * 255)));
          arr[i + 1] = Math.max(0, Math.min(255, Math.round(lut[arr[i + 1]] * 255)));
          arr[i + 2] = Math.max(0, Math.min(255, Math.round(lut[arr[i + 2]] * 255)));
        }
        sctx.putImageData(data, 0, 0);
      }

      // Destination canvas to apply CSS-like filters
      const dstCanvas = document.createElement('canvas');
      dstCanvas.width = w; dstCanvas.height = h;
      const dctx = dstCanvas.getContext('2d');
      if (!dctx) return null;
      dctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;
      dctx.drawImage(srcCanvas, 0, 0, w, h);

      const blob: Blob = await new Promise((resolve) => dstCanvas.toBlob(b => resolve(b as Blob), 'image/png', 0.92));
      return { blob, suggestedName: `${suggestedBase}_edited.png`, kind: 'image' };
    }
    // Video: capture current frame as snapshot using the video element if present
    const el = videoRef.current;
    if (!el) return null;
    const canvas = document.createElement('canvas');
    const maxW = 1920, maxH = 1080; // default snapshot bounds
    const vw = el.videoWidth || 1280;
    const vh = el.videoHeight || 720;
    const scale = Math.min(1, maxW / vw, maxH / vh);
    canvas.width = Math.max(1, Math.floor(vw * scale));
    canvas.height = Math.max(1, Math.floor(vh * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;
    try { ctx.drawImage(el, 0, 0, canvas.width, canvas.height); }
    catch { return null; }
    const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/png', 0.92));
    return { blob, suggestedName: `${suggestedBase}_snapshot.png`, kind: 'snapshot' };
  };

  const doSaveNew = async () => {
    try {
      const exported = await exportAdjustedBlob();
      if (!exported) return;
      const { blob, suggestedName } = exported;
      setPendingExport({ blob, suggestedName: suggestedName.replace(/\.\w+$/, '') }); // Remove extension for easier editing
      setShowFileNameDialog(true);
    } catch (e) {
      console.warn('Export failed:', e);
    }
  };

  const handleFileNameConfirm = async (userFilename: string) => {
    if (!pendingExport) return;

    try {
      const { blob } = pendingExport;

      // Clean filename and ensure it has an extension
      const cleanFilename = userFilename.trim().replace(/\s+/g, '_');
      const finalFilename = cleanFilename.includes('.') ? cleanFilename : `${cleanFilename}.png`;
      const result = await pageforgeApi.uploadEditedMedia({
        file: blob,
        filename: finalFilename,
        mediaType: selectedItem!.type === 'image' ? 'image' : 'snapshot',
      });
      if (!result.success) {
        // Fallback: trigger a download so users can keep the edited media
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        onChanged?.();
      }
    } catch (e) {
      // As ultimate fallback, do nothing (UI remains stable)
      console.warn('Save edited media failed:', e);
    } finally {
      setShowFileNameDialog(false);
      setPendingExport(null);
    }
  };

  const handleFileNameCancel = () => {
    setShowFileNameDialog(false);
    setPendingExport(null);
  };

  const doUpdateExisting = async () => {
    if (!selectedItem || selectedItem.type !== 'image') return; // Replace only supported for images
    try {
      const exported = await exportAdjustedBlob();
      if (!exported) return;
      const { blob, suggestedName } = exported;
      const res = await pageforgeApi.replaceImageContent(selectedItem.id, blob, suggestedName);
      if (!res.success) {
        console.warn('Update failed:', res.message);
        return;
      }
      onChanged?.();
    } catch (e) {
      console.warn('Update existing image failed:', e);
    }
  };

  if (!selectedItem) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Media Editor</h3>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <AdjustmentsHorizontalIcon className="w-12 h-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400 text-sm">Select an image to start editing</p>
        </div>
      </div>
    );
  }

  const src = selectedItem.thumbnail || selectedItem.url;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Media Editor</h3>

      {/* Hidden SVG filter providing simple 3-point curves (images only) */}
      {selectedItem.type === 'image' && (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="table" tableValues={tableValues} />
              <feFuncG type="table" tableValues={tableValues} />
              <feFuncB type="table" tableValues={tableValues} />
              <feFuncA type="identity" />
            </feComponentTransfer>
          </filter>
        </svg>
      )}

      {/* Preview */}
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-transparent">
        <div className="bg-gray-900/50 text-xs text-gray-300 px-3 py-2 flex items-center justify-between">
          <span>{selectedItem.name} {croppedImageUrl && <span className="text-blue-400">(Cropped)</span>}
          </span>
          <div className="inline-flex items-center gap-2">
            {/* Crop button (images only) */}
            {selectedItem.type === 'image' && !showCropper && (
              <button
                onClick={() => setShowCropper(true)}
                className="inline-flex items-center gap-1 text-purple-300 hover:text-white border border-purple-700/40 rounded px-2 py-0.5"
              >
                <ScissorsIcon className="w-4 h-4" /> Crop
              </button>
            )}
            {!showCropper && (
              <>
                <button onClick={onReset} className="inline-flex items-center gap-1 text-blue-300 hover:text-white">
                  <ArrowPathIcon className="w-4 h-4" /> Reset
                </button>
                {/* Update same file (images only) */}
                {selectedItem.type === 'image' && (
                  <button onClick={doUpdateExisting} className="inline-flex items-center gap-1 text-amber-300 hover:text-white border border-amber-700/40 rounded px-2 py-0.5">
                    Update
                  </button>
                )}
                {/* Save as new file */}
                <button onClick={doSaveNew} className="inline-flex items-center gap-1 text-green-300 hover:text-white border border-green-700/40 rounded px-2 py-0.5">
                  Save as New
                </button>
              </>
            )}
          </div>
        </div>
        <div className="aspect-video bg-transparent flex items-center justify-center relative">
          {showCropper && selectedItem.type === 'image' ? (
            <InlineImageCropper
              imageUrl={croppedImageUrl || selectedItem.url}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          ) : selectedItem.type === 'image' ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={croppedImageUrl || src} style={{ filter: cssFilter, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />) : (
            <VideoPreview item={selectedItem} cssFilter={cssFilter} videoRef={videoRef} />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic adjustments */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Basic</h4>
          <div className="space-y-3">
            <Slider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} suffix="%" />
            <Slider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} suffix="%" />
            <Slider label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} suffix="%" />
            <Slider label="Grayscale" value={grayscale} min={0} max={100} onChange={setGrayscale} suffix="%" />
          </div>
        </div>

        {/* Curves (images only) */}
        {selectedItem.type === 'image' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">Curves</h4>
              <label className="inline-flex items-center gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={curvesEnabled} onChange={(e) => setCurvesEnabled(e.target.checked)} /> Enable
              </label>
            </div>
            <CurvePreview shadows={curves.shadows} midtones={curves.midtones} highlights={curves.highlights} />
            <div className="space-y-3 mt-3">
              <Slider label="Shadows" value={curves.shadows} min={-100} max={100} onChange={(v) => setCurves(c => ({ ...c, shadows: v }))} />
              <Slider label="Midtones" value={curves.midtones} min={-100} max={100} onChange={(v) => setCurves(c => ({ ...c, midtones: v }))} />
              <Slider label="Highlights" value={curves.highlights} min={-100} max={100} onChange={(v) => setCurves(c => ({ ...c, highlights: v }))} />
            </div>
          </div>
        )}
      </div>
      {/* File Name Dialog */}
      <FileNameDialog
        isOpen={showFileNameDialog}
        defaultValue={pendingExport?.suggestedName || ''}
        title="Save Edited Image"
        description="Enter a name for your edited image:"
        onConfirm={handleFileNameConfirm}
        onCancel={handleFileNameCancel}
      />
    </div>
  );
};

interface SliderProps { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (n: number) => void }
const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, suffix = '', onChange }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-300 mb-1">
      <span>{label}</span>
      <span>{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-500"
    />
  </div>
);

const CurvePreview: React.FC<CurveValues> = ({ shadows, midtones, highlights }) => {
  const lut = useMemo(() => buildCurveLUT({ shadows, midtones, highlights }), [shadows, midtones, highlights]);
  // Render a small 120x80 graph of the curve
  const points = useMemo(() => lut.map((v, i) => ({ x: i, y: 1 - v })), [lut]);
  const d = useMemo(() => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y * 80}`).join(' ');
  }, [points]);
  return (
    <svg viewBox="0 0 255 80" className="w-full h-16 bg-gray-900 rounded-md border border-gray-700">
      <path d={d} stroke="#60a5fa" strokeWidth={2} fill="none" />
      <rect x={0} y={0} width={255} height={80} fill="none" stroke="#374151" strokeWidth={1} />
    </svg>
  );
};

export default ImageEditor;

// --- Video preview component with HLS.js support ---
const VideoPreview: React.FC<{ item: MediaItem; cssFilter: string; videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ item, cssFilter, videoRef }) => {
  const url = item.url || '';
  const isHls = /\.m3u8(\?|$)/.test(url);
  const isMp4 = /\.mp4(\?|$)/.test(url);

  if (!isHls && !isMp4 && item.id) {
    // Fallback to Cloudflare Stream iframe player
    const iframeSrc = `https://iframe.videodelivery.net/${item.id}`;
    return (
      <div style={{ width: '100%', height: '100%', filter: cssFilter }}>
        <iframe
          src={iframeSrc}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: '0' }}
          title={item.name}
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      style={{ filter: cssFilter, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
    />
  );
};
