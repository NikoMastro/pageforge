import React from 'react';

type BackgroundMediaProps = {
  src?: string | null;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  lazy?: boolean;
  /**
   * Pin the media to the viewport instead of stretching it over the whole
   * page. Without this, `object-cover` sizes the media against the full
   * document height (thousands of px on long pages), which zooms the image
   * enormously. The sticky frame keeps the media exactly one viewport tall
   * while it follows the scroll — and, unlike `position: fixed`, it stays
   * inside scaled/overflow containers such as the editor preview.
   */
  pinToViewport?: boolean;
};

const isHls = (url: string) => /\.m3u8(\?|$)/i.test(url);
const isDash = (url: string) => /\.mpd(\?|$)/i.test(url);
const isVideoFile = (url: string) => /(\.mp4|\.webm|\.ogg)(\?|$)/i.test(url);
const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Instagram|TikTok/i.test(ua) ||
    /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
};

const hasIntersectionObserver = (): boolean => {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
};

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  poster,
  lazy = true,
  pinToViewport = false,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const shouldUseLazy = lazy && hasIntersectionObserver();
  const [canInit, setCanInit] = React.useState(!shouldUseLazy);
  const [videoFailed, setVideoFailed] = React.useState(false);

  if (!src) return null;

  const url = src;
  const showVideo = (isHls(url) || isDash(url) || isVideoFile(url)) && !videoFailed;
  const showImage = !showVideo;

  React.useEffect(() => {
    if (!shouldUseLazy || canInit || !showVideo) return;
    const el = videoRef.current;
    if (!el) return;

    if (!hasIntersectionObserver()) {
      setCanInit(true);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible) {
        setCanInit(true);
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(el as Element);
    return () => io.disconnect();
  }, [shouldUseLazy, canInit, showVideo]);

  React.useEffect(() => {
    if (!showVideo || !canInit || !url || !videoRef.current) return;
    const video = videoRef.current;
    let hls: any;
    let dashPlayer: any;
    const inApp = isInAppBrowser();

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch((err) => {
          console.warn('Video autoplay blocked:', err);
          if (inApp && !poster) {
            video.currentTime = 0;
            video.pause();
          }
        });
      }
    };

    // WKWebView video error handler
    const handleVideoError = () => {
      console.warn('Video failed to load, falling back to image');
      setVideoFailed(true);
    };

    video.addEventListener('error', handleVideoError);

    const init = async () => {
      // For in-app browsers, ensure proper attributes are set
      if (inApp) {
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.muted = true;
      }

      if (isHls(url) && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        tryPlay();
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
            hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            // Handle HLS errors
            hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
              if (data.fatal) {
                console.warn('HLS fatal error, falling back');
                setVideoFailed(true);
              }
            });
            return;
          }
        } catch {
          video.src = url;
          tryPlay();
          return;
        }
      }

      if (isDash(url)) {
        if (inApp) {
          console.warn('DASH not supported in in-app browser, showing fallback');
          setVideoFailed(true);
          return;
        }
        try {
          const mod = await import('dashjs');
          const dashjs = (mod as any).default || (mod as any);
          dashPlayer = dashjs.MediaPlayer().create();
          dashPlayer.initialize(video, url, true);
          return;
        } catch {
          video.src = url;
          tryPlay();
          return;
        }
      }

      // MP4/WEBM/OGG direct
      if (isVideoFile(url)) {
        video.src = url;
        tryPlay();
      }
    };

    init();

    return () => {
      video.removeEventListener('error', handleVideoError);
      if (hls) {
        try { hls.destroy(); } catch { }
      }
      if (dashPlayer) {
        try { dashPlayer.reset && dashPlayer.reset(); } catch { }
      }
    };
  }, [showVideo, canInit, url, poster]);

  // When pinned, responsive visibility/z-index classes go on the outer frame
  // and the media fills a viewport-tall sticky box instead of the whole page.
  const mediaClassName = pinToViewport
    ? 'pointer-events-none select-none absolute inset-0 w-full h-full object-cover gpu-accelerated'
    : `pointer-events-none select-none absolute inset-0 w-full h-full object-cover gpu-accelerated ${className}`;

  const pinWrapper = (media: React.ReactNode) => (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div className="sticky top-0 h-screen w-full">{media}</div>
    </div>
  );

  // Render image fallback if not a recognized video url or video failed
  if (showImage) {
    const img = (
      <img
        data-bg-media
        src={url}
        alt="background"
        className={mediaClassName}
        loading={lazy ? 'lazy' : undefined}
        style={{ willChange: 'transform' }}
      />
    );
    return pinToViewport ? pinWrapper(img) : img;
  }

  if (showVideo) {
    const video = (
      <video
        data-bg-media
        ref={videoRef}
        className={mediaClassName}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        // @ts-ignore - webkit-playsinline is a non-standard attribute
        webkit-playsinline="true"
        controls={false}
        preload={lazy ? 'metadata' : 'auto'}
        poster={poster}
        style={{ willChange: 'transform' }}
      />
    );
    return pinToViewport ? pinWrapper(video) : video;
  }
  return null;
};

export default BackgroundMedia;
