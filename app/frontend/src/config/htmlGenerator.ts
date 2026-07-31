import type { HtmlGeneratorConfig } from '../types/api.types';
import { PIXEL_SCRIPT_URLS } from './app';

function buildPixelScript(gameId: string, partnerId: string, isTest: boolean = true, cookieBannerEnabled: boolean = true): string {
  return `
    <script>
      var partner_id = "${partnerId}";
      var game_id = "${gameId}";
      var is_test = ${isTest};

      !(function (w, d, s, pixelName, a, c, g) {
        if (!w[pixelName])
          try {
            (a = w[pixelName] =
              function () {
                a.process
                  ? a.process.apply(a, arguments)
                  : a.queue.push(arguments);
              }).queue = [];
            a.t = +new Date();
            (c = d.createElement(s)).async = 1;
            c.src =
              "${PIXEL_SCRIPT_URLS.BASE}/pixel_twitter.js?t=" +
              864e5 * Math.ceil(new Date() / 864e5);
            (g = d.getElementsByTagName(s)[0]).parentNode.insertBefore(c, g);
          } catch (e) {
            console.error("Pixel initialization failed:", e);
          }
      })(window, document, "script", "apxl");

      apxl("init");

      function tryInitPixel(){
        if (typeof main === "function") {
          try { main(is_test, game_id, partner_id); } catch (e) { console.error(e); }
        }
      }

      ${cookieBannerEnabled ? `
      (function(){
        var consent = null; try { consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null'); } catch {}
        var accepted = consent && consent.status === 'accepted';
        if (accepted) {
          window.addEventListener('load', function(){ tryInitPixel(); });
        } else {
          document.addEventListener('cookie-consent-accepted', function(){ tryInitPixel(); }, { once: true });
          document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.classList && t.classList.contains('cky-btn-accept')) { tryInitPixel(); }
          });
        }
      })();
      ` : `
      window.addEventListener('load', function(){ tryInitPixel(); });
      `}
    </script>`;
}


function buildGlobalPixelScript(cfg: HtmlGeneratorConfig): string {
  const partnerId = cfg.partnerId || '';
  const gameId = cfg.gameId || '';
  const isTest = cfg.isTest ?? true;
  const detectionType = (cfg as any).detectionType || '';
  const mainUrl = ((cfg as any).mainUrl && (cfg as any).mainUrl.trim()) || null;
  const fallbackUrl = ((cfg as any).fallbackUrl && (cfg as any).fallbackUrl.trim()) || null;
  const cookieBannerEnabled = !!(cfg as any).cookieBannerEnabled;
  return `
    <script>
      var partner_id = "${partnerId}";
      var game_id = "${gameId}";
      var is_test = ${isTest};
      var detection_type = ${JSON.stringify(detectionType)};
      var main_url = ${JSON.stringify(mainUrl)};
      var fallback_url = ${JSON.stringify(fallbackUrl)};

      !(function (w, d, s, pixelName, a, c, g) {
        if (!w[pixelName])
          try {
            (a = w[pixelName] =
              function () {
                a.process
                  ? a.process.apply(a, arguments)
                  : a.queue.push(arguments);
              }).queue = [];
            a.t = +new Date();
            (c = d.createElement(s)).async = 1;
            c.src =
              "${PIXEL_SCRIPT_URLS.BASE}/pixel_global.js?t=" +
              864e5 * Math.ceil(new Date() / 864e5);
            (g = d.getElementsByTagName(s)[0]).parentNode.insertBefore(c, g);
          } catch (e) {
            console.error("Pixel initialization failed:", e);
          }
      })(window, document, "script", "apxl");

      apxl("init");

      function tryInitGlobal(){
        if (typeof main === "function") {
          try { main(is_test, game_id, partner_id, detection_type, main_url, fallback_url); } catch(e){ console.error(e); }
        }
      }

      ${cookieBannerEnabled ? `
      (function(){
        var consent = null; try { consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null'); } catch {}
        var accepted = consent && consent.status === 'accepted';
        if (accepted) {
          window.addEventListener('load', function(){ tryInitGlobal(); });
        } else {
          document.addEventListener('cookie-consent-accepted', function(){ tryInitGlobal(); }, { once: true });
          document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.classList && t.classList.contains('cky-btn-accept')) { tryInitGlobal(); }
          });
        }
      })();
      ` : `
      window.addEventListener('load', function(){ tryInitGlobal(); });
      `}
    </script>`;
}

function buildCustomPixelScript(gameId: string, partnerId: string, customPixelUrl: string, isTest: boolean = true, cookieBannerEnabled: boolean = true, customPixelVars?: Array<{ key: string; value: string }> | string): string {
  let customVarsDeclarations = '';
  let customVarsParams = '';

  let vars = customPixelVars;
  if (typeof customPixelVars === 'string') {
    try {
      vars = JSON.parse(customPixelVars);
    } catch {
      vars = [];
    }
  }

  if (vars && Array.isArray(vars)) {
    vars.forEach((kv: any) => {
      if (kv && kv.key) {
        const safeValue = JSON.stringify(String(kv.value ?? ''));
        customVarsDeclarations += `\n      var ${kv.key} = ${safeValue};`;
        customVarsParams += `, ${kv.key}`;
      }
    });
  }

  return `
    <script>
  var partner_id = "${partnerId}";
      var game_id = "${gameId}";
      var is_test = ${isTest};${customVarsDeclarations}

      !(function (w, d, s, pixelName, a, c, g) {
        if (!w[pixelName])
          try {
            (a = w[pixelName] =
              function () {
                a.process
                  ? a.process.apply(a, arguments)
                  : a.queue.push(arguments);
              }).queue = [];
            a.t = +new Date();
            (c = d.createElement(s)).async = 1;
            c.src = "${customPixelUrl}";
            (g = d.getElementsByTagName(s)[0]).parentNode.insertBefore(c, g);
          } catch (e) {
            console.error("Custom pixel initialization failed:", e);
          }
      })(window, document, "script", "apxl");

      apxl("init");

  function tryInitCustom(){ if (typeof main === 'function') { try { main(is_test, game_id, partner_id${customVarsParams}); } catch(e){} } }
      ${cookieBannerEnabled ? `
      (function(){
        var consent = null; try { consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null'); } catch {}
        var accepted = consent && consent.status === 'accepted';
        if (accepted) {
          window.addEventListener('load', function(){ tryInitCustom(); });
        } else {
          document.addEventListener('cookie-consent-accepted', function(){ tryInitCustom(); }, { once: true });
          document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.classList && t.classList.contains('cky-btn-accept')) { tryInitCustom(); }
          });
        }
      })();
      ` : `
      window.addEventListener('load', function(){ tryInitCustom(); });
      `}
    </script>`;
}

function buildPfTagPixelScript(cfg: HtmlGeneratorConfig, isProd: boolean = true): string {
  const partnerId = cfg.partnerId || '';
  const gameId = cfg.gameId || '';
  const isTest = cfg.isTest ?? false;
  const detectionType = (cfg as any).detectionType || '';
  const mainUrl = ((cfg as any).mainUrl && (cfg as any).mainUrl.trim()) || null;
  const fallbackUrl = ((cfg as any).fallbackUrl && (cfg as any).fallbackUrl.trim()) || null;
  const cookieBannerEnabled = !!(cfg as any).cookieBannerEnabled;

  const pixelUrl = isProd
    ? PIXEL_SCRIPT_URLS.PFTAG_PROD
    : PIXEL_SCRIPT_URLS.PFTAG_PREPROD;

  return `
    <script>
      var partner_id = "${partnerId}";
      var game_id = "${gameId}";
      var is_test = ${isTest};
      var detection_type = ${JSON.stringify(detectionType)};
      var main_url = ${JSON.stringify(mainUrl)};
      var fallback_url = ${JSON.stringify(fallbackUrl)};

      !(function (w, d, s, pixelName, a, c, g) {
        if (!w[pixelName])
          try {
            (a = w[pixelName] =
              function () {
                a.process
                  ? a.process.apply(a, arguments)
                  : a.queue.push(arguments);
              }).queue = [];
            a.t = +new Date();
            (c = d.createElement(s)).async = 1;
            c.src = "${pixelUrl}";
            (g = d.getElementsByTagName(s)[0]).parentNode.insertBefore(c, g);
          } catch (e) {
            console.error("Custom pixel initialization failed:", e);
          }
      })(window, document, "script", "apxl");

      apxl("init");

  function tryInitCustom(){ if (typeof main === 'function') { try { main(is_test, game_id, partner_id, detection_type, main_url, fallback_url); } catch(e){} } }

      ${cookieBannerEnabled ? `
      (function(){
        var consent = null; try { consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null'); } catch {}
        var accepted = consent && consent.status === 'accepted';
        if (accepted) {
          window.addEventListener('load', function(){ tryInitCustom(); });
        } else {
          document.addEventListener('cookie-consent-accepted', function(){ tryInitCustom(); }, { once: true });
          document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.classList && t.classList.contains('cky-btn-accept')) { tryInitCustom(); }
          });
        }
      })();
      ` : `
      window.addEventListener('load', function(){ tryInitCustom(); });
      `}
    </script>`;
}

function pixelScriptByMode(cfg: HtmlGeneratorConfig): string {
  if (!cfg.pixelMode || cfg.pixelMode === 'none' || (!cfg.gameId && cfg.pixelMode !== 'global')) return '';
  const cookieBannerEnabled = !!(cfg as any).cookieBannerEnabled;
  if (cfg.pixelMode === 'global') {
    return buildGlobalPixelScript(cfg);
  }
  if (cfg.pixelMode === 'custom') {
    if (!cfg.customPixelUrl) {
      return '';
    }
    const customPixelVars = (cfg as any).customPixelVars;
    return buildCustomPixelScript(cfg.gameId!, cfg.partnerId || '', cfg.customPixelUrl, cfg.isTest ?? true, cookieBannerEnabled, customPixelVars);
  }
  if (cfg.pixelMode === 'pftag_prod') {
    return buildPfTagPixelScript(cfg, true);
  }
  if (cfg.pixelMode === 'pftag_preprod') {
    return buildPfTagPixelScript(cfg, false);
  }
  return buildPixelScript(cfg.gameId!, cfg.partnerId || '', cfg.isTest ?? true, cookieBannerEnabled);
}

function buildFontLinks(landingPageData?: any): string {
  if (!landingPageData?.settings?.theme) return '';
  const theme = landingPageData.settings.theme;
  const fontFamily = theme.fontFamily || theme.headingFontFamily;
  if (!fontFamily || typeof fontFamily !== 'string') return '';

  let primary = fontFamily.split(',')[0].trim();
  if ((primary.startsWith('"') && primary.endsWith('"')) || (primary.startsWith("'") && primary.endsWith("'"))) {
    primary = primary.slice(1, -1).trim();
  }
  if (!primary) return '';

  const lower = primary.toLowerCase();
  const GENERIC_OR_SYSTEM = new Set([
    'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
    'arial', 'helvetica', 'georgia', 'times new roman', 'segoe ui', 'courier new'
  ]);
  if (GENERIC_OR_SYSTEM.has(lower)) return '';

  const familyParam = primary.replace(/\s+/g, '+');
  const WEIGHTS = '300;400;500;600;700;800';
  const href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${WEIGHTS}&display=swap`;

  return `<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin="anonymous" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />\n    <link rel="stylesheet" href="${href}" crossorigin="anonymous" />`;
}

export function generateHtml(cfg: HtmlGeneratorConfig, landingPageData?: any): string {
  const pixelScripts = pixelScriptByMode(cfg);
  const fontLinks = buildFontLinks(landingPageData);

  const isPhoneLayout = true;

  const phoneViewportMeta = isPhoneLayout
    ? '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />'
    : '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />';

  const inAppBrowserStyles = isPhoneLayout
    ? `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      html {
        touch-action: manipulation;
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        --vh: 1vh;
        --dvh: 1dvh;
        --safe-top: env(safe-area-inset-top, 0px);
        --safe-bottom: env(safe-area-inset-bottom, 0px);
        --safe-left: env(safe-area-inset-left, 0px);
        --safe-right: env(safe-area-inset-right, 0px);
      }
      body {
        overscroll-behavior-y: contain;
        overscroll-behavior: none;
        min-height: 100vh;
        min-height: 100dvh;
        min-height: -webkit-fill-available;
        position: fixed;
        width: 100%;
        overflow: hidden;
      }
      #root {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }
      input, textarea, select {
        font-size: 16px !important;
        touch-action: manipulation;
      }
      .scroll-container { -webkit-overflow-scrolling: touch; }
      a, button {
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .fixed-element {
        position: fixed;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      video {
        -webkit-playsinline: true;
        playsinline: true;
      }
      .in-app-browser ::-webkit-scrollbar { display: none; }
      .in-app-browser { scrollbar-width: none; -ms-overflow-style: none; }
      @supports not (gap: 1rem) {
        .flex-gap-fallback > * + * { margin-left: 1rem; }
      }`
    : '';

  const inAppBrowserScript = isPhoneLayout
    ? `
    <script>
      (function() {
        function setVH() {
          var vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', vh + 'px');
          document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
        }
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', function() { setTimeout(setVH, 100); });

        var ua = navigator.userAgent || navigator.vendor || window.opera;
        var isInstagram = /Instagram/i.test(ua);
        var isFacebook = /FBAN|FBAV/i.test(ua);
        var isTikTok = /TikTok/i.test(ua);
        var isSnapchat = /Snapchat/i.test(ua);
        var isTwitter = /Twitter/i.test(ua);
        var isLine = /Line/i.test(ua);
        var isKakao = /KAKAOTALK/i.test(ua);
        var isWhatsApp = /WhatsApp/i.test(ua);
        var isInAppBrowser = isInstagram || isFacebook || isTikTok || isSnapchat || isTwitter || isLine || isKakao || isWhatsApp;

        var isWKWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

        if (isInAppBrowser || isWKWebView) {
          document.documentElement.classList.add('in-app-browser');
          if (isInstagram) document.documentElement.classList.add('instagram-browser');
          if (isWKWebView) document.documentElement.classList.add('wkwebview');

          document.body.style.display = 'none';
          document.body.offsetHeight;
          document.body.style.display = '';

          document.addEventListener('touchmove', function(e) {
            if (e.target.closest('#root')) return;
            e.preventDefault();
          }, { passive: false });
        }

        if (!CSS.supports('height', '100dvh')) {
          document.documentElement.style.setProperty('--dvh-fallback', window.innerHeight + 'px');
          var style = document.createElement('style');
          style.textContent = 'html, body, #root { height: var(--app-height, 100vh) !important; min-height: var(--app-height, 100vh) !important; }';
          document.head.appendChild(style);
        }

        if (!('IntersectionObserver' in window)) {
          console.warn('IntersectionObserver not supported, lazy loading disabled');
          document.documentElement.classList.add('no-intersection-observer');
        }

        document.addEventListener('DOMContentLoaded', function() {
          var videos = document.querySelectorAll('video[autoplay]');
          videos.forEach(function(video) {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.muted = true;
            video.play().catch(function() {
              if (video.poster) return;
              video.currentTime = 0;
            });
          });
        });
      })();
    </script>`
    : '';

  const isEmojiFavicon = cfg.faviconLink && /^\p{Emoji}$/u.test(cfg.faviconLink);
  const faviconLink = isEmojiFavicon
    ? `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${cfg.faviconLink}</text></svg>" />`
    : `<link rel="icon" type="image/x-icon" href="${cfg.faviconLink}" />`;

  const ogTitle = cfg.title || '';
  const ogDescription = cfg.tagline || '';
  let ogImage = '';
  if (landingPageData?.sections) {
    const backgroundSection = landingPageData.sections.find((s: any) => s.type === 'background');
    if (backgroundSection?.props) {
      // Prefer phone background, fallback to desktop background
      ogImage = backgroundSection.props.phoneSrc || backgroundSection.props.src || '';
    }
  }

  const openGraphTags = `
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:type" content="website" />${ogImage ? `
    <meta property="og:image" content="${ogImage}" />` : ''}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${cfg.title}</title>
    ${faviconLink}
    ${phoneViewportMeta}
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#111924" />
    <meta name="format-detection" content="telephone=no" />
    ${openGraphTags}
    ${fontLinks}
    <style>
      html, body { height:100%; margin:0; padding:0; background:#111924; -webkit-tap-highlight-color:transparent; }
      #root { min-height:100vh; min-height:100dvh; margin:0; display:flex; width:100%; flex:1;
             padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
      .tagline { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }${inAppBrowserStyles}
    </style>
${pixelScripts}
${inAppBrowserScript}
  </head>
  <body>
    <div id="root">
      <h1 class="tagline">${cfg.tagline}</h1>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}
