import React from 'react';
import BackgroundMedia from '../backgroundMedia';

export type VideoPlayerBackgroundType =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradient: string }
  | { type: 'image'; src: string }
  | { type: 'video'; src: string };

export type VideoSourceType =
  | { type: 'url'; url: string }
  | { type: 'embed'; embedCode: string }
  | { type: 'cloudflare'; src: string };

export interface VideoPlayerProps {
  background?: VideoPlayerBackgroundType;
  videoSource: VideoSourceType;
  videoWidth?: string | number;
  videoHeight?: string | number;
  aspectRatio?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  containerClassName?: string;
  videoClassName?: string;
  playsInline?: boolean;
  poster?: string;
  display?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  background = { type: 'solid', color: '#000000' },
  videoSource,
  videoWidth = '100%',
  videoHeight = 'auto',
  aspectRatio = '16/9',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
  containerClassName = '',
  videoClassName = '',
  playsInline = true,
  poster,
  display = true,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [canInit, setCanInit] = React.useState(false);

  if (!display) return null;

  // Background style based on type
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: '#000000' };

    switch (background.type) {
      case 'solid':
        return { backgroundColor: background.color };
      case 'gradient':
        return { background: background.gradient };
      case 'image':
      case 'video':
        return { position: 'relative' };
      default:
        return { backgroundColor: '#000000' };
    }
  };

  // Lazy loading for video
  React.useEffect(() => {
    if (videoSource.type !== 'cloudflare' || canInit) return;
    const el = videoRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible) {
        setCanInit(true);
        io.disconnect();
      }
    }, { rootMargin: '200px' });

    io.observe(el as Element);
    return () => io.disconnect();
  }, [canInit, videoSource.type]);

  // Handle video initialization for HLS/DASH
  React.useEffect(() => {
    if (videoSource.type !== 'cloudflare' || !canInit || !videoRef.current) return;

    const video = videoRef.current;
    const url = videoSource.src;
    let hls: any;
    let dashPlayer: any;

    const isHls = (url: string) => /\.m3u8(\?|$)/i.test(url);
    const isDash = (url: string) => /\.mpd(\?|$)/i.test(url);

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {/* ignore autoplay rejection */ });
      }
    };

    const init = async () => {
      // Native HLS on Safari
      if (isHls(url) && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        if (autoPlay) tryPlay();
        return;
      }

      if (isHls(url)) {
        try {
          const mod = await import('hls.js');
          const Hls = (mod as any).default || (mod as any);
          if (Hls.isSupported()) {
            hls = new Hls({ autoStartLoad: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            if (autoPlay) {
              hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            }
            return;
          }
        } catch {
          video.src = url;
          if (autoPlay) tryPlay();
          return;
        }
      }

      if (isDash(url)) {
        try {
          const mod = await import('dashjs');
          const dashjs = (mod as any).default || (mod as any);
          dashPlayer = dashjs.MediaPlayer().create();
          dashPlayer.initialize(video, url, autoPlay);
          return;
        } catch {
          video.src = url;
          if (autoPlay) tryPlay();
          return;
        }
      }

      // Direct MP4/WEBM/OGG
      video.src = url;
      if (autoPlay) tryPlay();
    };

    init();

    return () => {
      if (hls) {
        try { hls.destroy(); } catch { }
      }
      if (dashPlayer) {
        try { dashPlayer.reset && dashPlayer.reset(); } catch { }
      }
    };
  }, [canInit, videoSource, autoPlay]);

  // Render video content
  const renderVideoContent = () => {
    switch (videoSource.type) {
      case 'url':
        // Direct URL (like YouTube, Vimeo links)
        if (videoSource.url.includes('youtube.com') || videoSource.url.includes('youtu.be')) {
          let videoId = '';
          if (videoSource.url.includes('youtu.be/')) {
            videoId = videoSource.url.split('youtu.be/')[1]?.split('?')[0] || '';
          } else if (videoSource.url.includes('youtube.com/watch?v=')) {
            videoId = videoSource.url.split('v=')[1]?.split('&')[0] || '';
          } else if (videoSource.url.includes('youtube.com/embed/')) {
            videoId = videoSource.url.split('embed/')[1]?.split('?')[0] || '';
          }

          if (videoId) {
            return (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}`}
                className={`w-full h-full border-none rounded-md ${videoClassName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Player"
              />
            );
          }
        }

        // Generic video URL
        if (!videoSource.url) return null;

        return (
          <video
            className={`w-full h-full object-contain rounded-md ${videoClassName}`}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline={playsInline}
            poster={poster}
          >
            <source src={videoSource.url} />
            Your browser does not support the video tag.
          </video>
        );

      case 'embed':
        // Embed code (iframe or custom HTML)
        // Wrap in a flex container to properly center iframes
        return (
          <>
            <style dangerouslySetInnerHTML={{
              __html: `
                .video-embed-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .video-embed-container iframe {
                  display: block;
                  margin: 0 auto;
                  max-width: 100%;
                  max-height: 100%;
                }
              `
            }} />
            <div
              className={`video-embed-container w-full h-full ${videoClassName}`}
              dangerouslySetInnerHTML={{ __html: videoSource.embedCode }}
            />
          </>
        );

      case 'cloudflare':
        // Cloudflare hosted video (supports HLS/DASH)
        return (
          <video
            ref={videoRef}
            className={`w-full h-full object-contain rounded-md ${videoClassName}`}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline={playsInline}
            preload="metadata"
            poster={poster}
          />
        );

      default:
        return null;
    }
  };

  return (
    <section
      className={`relative w-full overflow-hidden ${containerClassName}`}
      style={getBackgroundStyle()}
    >
      {/* Background media (image or video) - covers entire section */}
      {(background?.type === 'image' || background?.type === 'video') && background.src && (
        <BackgroundMedia
          src={background.src}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
        />
      )}

      {/* Video container - aspect ratio only affects video */}
      <div className={`relative flex items-center justify-center ${className}`}>
        <div
          className="w-full max-w-6xl mx-auto"
          style={{
            width: typeof videoWidth === 'number' ? `${videoWidth}px` : videoWidth,
          }}
        >
          <div
            className="relative w-full"
            style={{
              aspectRatio: aspectRatio,
              height: typeof videoHeight === 'number' ? `${videoHeight}px` : videoHeight,
            }}
          >
            {renderVideoContent()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
