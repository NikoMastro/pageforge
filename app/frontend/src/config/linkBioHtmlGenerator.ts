import type { LinkBioJson } from './linkBioJsonGenerator';
import { PIXEL_SCRIPT_URLS } from './app';

/**
 * Generate pixel script(s) for LinkBio similar to landing page behavior.
 * We only support the subset needed based on stored json.pixel.
 */
function buildLinkBioPixelScripts(json: LinkBioJson): string {
  const p = json.pixel;
  if (!p || !p.enabled || p.mode === 'none') return '';
  const gameId = p.gameId || '';
  const partnerId = p.partnerId || '';
  const isTest = p.isTest !== false;

  if (p.mode === 'custom' && p.customPixelUrl) {
    return `\n<script>\n  var partner_id=${JSON.stringify(partnerId)};\n  var game_id=${JSON.stringify(gameId)};\n  var is_test=${JSON.stringify(isTest)};\n  !(function(w,d,s,n,a,c,g){if(!w[n])try{(a=w[n]=function(){a.process?a.process.apply(a,arguments):a.queue.push(arguments)}).queue=[];a.t=+new Date();(c=d.createElement(s)).async=1;c.src=${JSON.stringify(p.customPixelUrl)};(g=d.getElementsByTagName(s)[0]).parentNode.insertBefore(c,g);}catch(e){console.error('Custom pixel init failed',e);}})(window,document,'script','apxl');\n  apxl('init');\n  function tryInit(){ if(typeof main==='function'){ try{ main(is_test, game_id, partner_id); }catch(e){ console.error(e);} } }\n  window.addEventListener('load',function(){ tryInit(); });\n</script>`;
  }

  // Legacy / full / global fallback to base pixel script (not implementing global detection logic yet for LinkBio to keep minimal)
  return `\n<script>\n  var partner_id=${JSON.stringify(partnerId)};\n  var game_id=${JSON.stringify(gameId)};\n  var is_test=${JSON.stringify(isTest)};\n  !(function(w,d,s,n,a,c,g){if(!w[n])try{(a=w[n]=function(){a.process?a.process.apply(a,arguments):a.queue.push(arguments)}).queue=[];a.t=+new Date();(c=d.createElement(s)).async=1;c.src='${PIXEL_SCRIPT_URLS.BASE}/pixel_twitter.js?t='+864e5*Math.ceil(new Date()/864e5);(g=d.getElementsByTagName(s)[0]).parentNode.insertBefore(c,g);}catch(e){console.error('Pixel init failed',e);}})(window,document,'script','apxl');\n  apxl('init');\n  function tryInit(){ if(typeof main==='function'){ try{ main(is_test, game_id, partner_id); }catch(e){ console.error(e);} } }\n  window.addEventListener('load',function(){ tryInit(); });\n</script>`;
}

export interface GenerateLinkBioHtmlOptions {
  json: LinkBioJson;
  embedJson?: boolean; // if true embed JSON payload for client bootstrap
}

export function generateLinkBioHtml(opts: GenerateLinkBioHtmlOptions): string {
  const { json, embedJson } = opts;
  const pixelScripts = buildLinkBioPixelScripts(json);
  const bg = json.appearance.background;
  const bgStyle = bg.type === 'gradient'
    ? bg.value
    : bg.value || '#111827';
  const embedded = embedJson ? `\n<script id="__LINKBIO_DATA__" type="application/json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>` : '';

  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>${escapeHtml(json.meta.title)}</title>\n<meta name="description" content=${JSON.stringify(json.meta.description || '')}/>\n<link rel="icon" href=${JSON.stringify(json.appearance.faviconUrl || '/favicon.ico')} />\n<meta property="og:title" content=${JSON.stringify(json.meta.title)} />\n<meta property="og:description" content=${JSON.stringify(json.meta.description || '')} />\n${json.appearance.illustrationUrl ? `<meta property=\"og:image\" content=${JSON.stringify(json.appearance.illustrationUrl)} />` : ''}\n<style>html,body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:${bg.type === 'gradient' ? bgStyle : bgStyle};min-height:100%;color:#f1f5f9;}a{text-decoration:none;color:#3b82f6;} .zt-container{max-width:640px;margin:0 auto;padding:32px 20px;display:flex;flex-direction:column;gap:24px;box-sizing:border-box;} .zt-profile{display:flex;align-items:center;gap:16px;} .zt-profile img{width:72px;height:72px;object-fit:cover;border-radius:50%;border:2px solid rgba(255,255,255,0.15);} .zt-links{display:flex;flex-direction:column;gap:12px;} .zt-links a{display:block;padding:14px 18px;border-radius:10px;background:rgba(255,255,255,0.07);backdrop-filter:blur(6px);font-weight:500;transition:background .18s,transform .18s;} .zt-links a:hover{background:rgba(255,255,255,0.13);transform:translateY(-2px);} .zt-footer{margin-top:12px;font-size:12px;opacity:.7;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;} .zt-footer a{color:#94a3b8;} .zt-social{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;} .zt-social a{background:rgba(255,255,255,0.09);padding:8px 14px;border-radius:20px;font-size:12px;} </style>\n${pixelScripts}\n</head>\n<body>\n<div class="zt-container">\n<section class="zt-profile">${json.appearance.profileImageUrl ? `<img src=${JSON.stringify(json.appearance.profileImageUrl)} alt="profile" />` : ''}<div><h1 style="margin:0;font-size:1.9rem;letter-spacing:.5px;">${escapeHtml(json.meta.title)}</h1>${json.meta.description ? `<p style=\"margin:6px 0 0;font-size:.9rem;line-height:1.3;opacity:.85;\">${escapeHtml(json.meta.description)}</p>` : ''}</div></section>\n${renderPrimaryLinks(json)}\n${renderSocial(json)}\n${renderFooter(json)}\n</div>${embedded}\n</body>\n</html>`;
}

function renderPrimaryLinks(json: LinkBioJson): string {
  const links: Array<{ label: string; url?: string; logoUrl?: string }> = [];
  const { stores, consoles, mobile } = json.links;
  const pushLink = (candidate: unknown, fallbackLabel: string) => {
    const normalized = normalizeLinkBioLink(candidate, fallbackLabel);
    if (normalized) links.push(normalized);
  };

  pushLink(stores?.steam, 'Steam');
  pushLink(stores?.epic, 'Epic Games Store');
  for (const customStore of stores?.custom || []) {
    pushLink(customStore, customStore.label || 'Store');
  }

  pushLink(consoles?.playstation, 'PlayStation');
  pushLink(consoles?.xbox, 'Xbox');
  pushLink((consoles as any)?.switch, 'Nintendo Switch');
  for (const customConsole of consoles?.custom || []) {
    pushLink(customConsole, customConsole.label || 'Console');
  }

  pushLink(mobile?.ios, 'iOS');
  pushLink(mobile?.android, 'Google Play');
  if (!links.length) return '';
  return `<div class=\"zt-links\">${links.map(l => {
    const content = l.logoUrl
      ? `<span style=\"display:inline-flex;align-items:center;gap:12px;\"><img src=${JSON.stringify(l.logoUrl)} alt=\"icon\" style=\"width:24px;height:24px;object-fit:contain\"/><span>${escapeHtml(l.label)}</span></span>`
      : escapeHtml(l.label);
    const platform = inferPlatformFromLabel(l.label);
    return `<a class=\"az-platform=${platform}\" href=${JSON.stringify(l.url)} target=\"_blank\" rel=\"noopener noreferrer\">${content}</a>`;
  }).join('')}</div>`;
}

function normalizeLinkBioLink(source: unknown, fallbackLabel: string): { label: string; url?: string; logoUrl?: string } | null {
  if (!source) return null;
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed) return null;
    return { label: fallbackLabel, url: trimmed };
  }
  if (typeof source === 'object') {
    const obj = source as {
      url?: string;
      label?: string;
      cta?: string;
      logoUrl?: string;
    };
    const url = typeof obj.url === 'string' ? obj.url : undefined;
    if (!url) return null;
    const label = obj.label || obj.cta || fallbackLabel;
    const logoUrl = typeof obj.logoUrl === 'string' ? obj.logoUrl : undefined;
    return { label, url, logoUrl };
  }
  return null;
}

function renderSocial(json: LinkBioJson): string {
  const { social } = json.links;
  const builtInEntries: Array<{ platform: string; label: string; url?: string; logoUrl?: string }> = [
    { platform: 'x', label: 'X', url: social.x },
    { platform: 'instagram', label: 'Instagram', url: social.instagram },
    { platform: 'discord', label: 'Discord', url: social.discord },
    { platform: 'youtube', label: 'YouTube', url: social.youtube }
  ].filter(s => !!s.url);

  const customEntries: Array<{ platform: string; label: string; url?: string; logoUrl?: string }> = ((social as any)?.custom || []).map((c: any, idx: number) => ({
    platform: `custom-${idx}`,
    label: '',
    url: c.url,
    logoUrl: c.logoUrl
  }));

  // Create a map for easy lookup
  const entryMap = new Map<string, { platform: string; label: string; url?: string; logoUrl?: string }>();
  builtInEntries.forEach(entry => entryMap.set(entry.platform, entry));
  customEntries.forEach((entry: { platform: string; label: string; url?: string; logoUrl?: string }) => entryMap.set(entry.platform, entry));

  // Apply ordering if specified
  let orderedEntries: typeof builtInEntries;
  if ((social as any)?.order && (social as any).order.length > 0) {
    orderedEntries = [];
    (social as any).order.forEach((platform: string) => {
      if (platform === 'custom') {
        // Add all custom entries when 'custom' is in order
        customEntries.forEach((entry: { platform: string; label: string; url?: string; logoUrl?: string }) => {
          if (entryMap.has(entry.platform)) {
            orderedEntries.push(entry);
          }
        });
      } else if (entryMap.has(platform)) {
        orderedEntries.push(entryMap.get(platform)!);
      }
    });
    // Add any remaining entries not in the order (fallback)
    entryMap.forEach((entry, platform) => {
      if (!orderedEntries.find(e => e.platform === platform)) {
        orderedEntries.push(entry);
      }
    });
  } else {
    // Default order: built-in entries first, then custom
    orderedEntries = [...builtInEntries, ...customEntries];
  }

  if (!orderedEntries.length) return '';
  return `<div class=\"zt-social\">${orderedEntries.map(e => {
    const content = e.logoUrl
      ? `<img src=${JSON.stringify(e.logoUrl)} alt=\"social\" style=\"width:32px;height:32px;object-fit:contain\"/>`
      : escapeHtml(e.label);
    const platform = e.logoUrl ? 'custom' : (e.label || 'custom');
    return `<a class=\"az-platform=${escapeHtml(platform.toLowerCase())}\" href=${JSON.stringify(e.url)} target=\"_blank\" rel=\"noopener noreferrer\">${content}</a>`;
  }).join('')}</div>`;
}

function renderFooter(json: LinkBioJson): string {
  const f = json.links.footer;
  const items: string[] = [];
  if (f.termsUrl) items.push(`<a class=\"az-platform=terms\" href=${JSON.stringify(f.termsUrl)} target=\"_blank\" rel=\"noopener noreferrer\">Terms</a>`);
  if (f.privacyUrl) items.push(`<a class=\"az-platform=privacy\" href=${JSON.stringify(f.privacyUrl)} target=\"_blank\" rel=\"noopener noreferrer\">Privacy</a>`);
  const custom = (f as any)?.custom || [];
  for (const c of custom) {
    if (!c || (!c.label && !c.url)) continue;
    const label = c.label || 'Link';
    items.push(`<a class=\"az-platform=${escapeHtml(label.toLowerCase().replace(/\s+/g, '-'))}\" href=${JSON.stringify(c.url)} target=\"_blank\" rel=\"noopener noreferrer\">${escapeHtml(label)}</a>`);
  }
  if (!items.length) return '';
  return `<div class=\"zt-footer\">${items.join('<span>•</span>')}</div>`;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Backwards-compatible alias pattern
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildLinkBioHtml = (...args: any[]) => generateLinkBioHtml(args[0]);
function inferPlatformFromLabel(label: string): string {
  const l = (label || '').toLowerCase();
  if (l.includes('steam')) return 'steam';
  if (l.includes('epic')) return 'epic';
  if (l.includes('playstation') || l.includes('ps5') || l.includes('ps4')) return 'playstation';
  if (l.includes('xbox')) return 'xbox';
  if (l.includes('switch') || l.includes('nintendo')) return 'switch';
  if (l.includes('ios') || l.includes('app store')) return 'ios';
  if (l.includes('android') || l.includes('google play')) return 'android';
  return 'custom';
}
