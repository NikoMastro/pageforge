import React from 'react';
import type { CookieBannerProps } from '../../types';

// Key used to persist consent decision
const CONSENT_KEY = 'cookieConsent';

const defaultTexts = {
  en: {
    header: 'This website uses cookies',
    body: 'We use cookies and other technologies that store or access information on your device when you visit our website to improve your experience. You can find more information in our Cookies Policy. By clicking “Accept All” you agree to our placing and use of optional cookies (as further described in the Cookies Policy). You can reject all non-essential cookies by choosing “Reject All”.',
    policy: 'Cookie Policy',
    accept: 'Accept All',
    reject: 'Reject All',
    customize: 'Customize',
    showMore: 'Show more',
    showLess: 'Show less',
    panelTitle: 'Customise Consent Preferences',
    panelIntro: 'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below. The cookies that are categorised as "Necessary" are essential for enabling the basic functionalities of the site. We also use third-party cookies that help us analyse how you use this website, store your preferences, and provide the content and advertisements that are relevant to you. These cookies will only be stored in your browser with your prior consent. You can choose to enable or disable some or all of these cookies but disabling some of them may affect your browsing experience.',
    categories: {
      necessary: {
        title: 'Necessary',
        desc: 'Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.'
      },
      functional: {
        title: 'Functional',
        desc: 'Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.'
      },
      analytics: {
        title: 'Analytics',
        desc: 'Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.'
      },
      performance: {
        title: 'Performance',
        desc: 'Performance cookies are used to understand and analyse the key performance indexes of the website which helps in delivering a better user experience for the visitors.'
      },
      advertisement: {
        title: 'Advertisement',
        desc: 'Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.'
      }
    },
    savePrefs: 'Save my preferences'
  },
  fr: {
    header: 'Ce site utilise des cookies',
    body: 'Nous utilisons des cookies et autres technologies qui stockent ou accèdent à des informations sur votre appareil lorsque vous visitez notre site afin d’améliorer votre expérience. En cliquant sur « Tout accepter », vous acceptez l’utilisation de cookies optionnels. Vous pouvez refuser tous les cookies non essentiels en cliquant sur « Tout refuser ».',
    policy: 'Politique de cookies',
    accept: 'Tout accepter',
    reject: 'Tout refuser',
    customize: 'Personnaliser',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',
    panelTitle: 'Personnaliser vos préférences',
    panelIntro: 'Nous utilisons des cookies pour vous aider à naviguer efficacement et à effectuer certaines fonctions... Ces cookies ne seront stockés qu’avec votre consentement.',
    categories: {
      necessary: { title: 'Nécessaires', desc: 'Cookies essentiels au bon fonctionnement du site.' },
      functional: { title: 'Fonctionnels', desc: 'Partage sur les réseaux sociaux, collecte de feedback, etc.' },
      analytics: { title: 'Analytiques', desc: 'Mesure d’audience, taux de rebond, sources de trafic, etc.' },
      performance: { title: 'Performance', desc: 'Améliorent l’expérience utilisateur.' },
      advertisement: { title: 'Publicité', desc: 'Publicités personnalisées et mesure des campagnes.' }
    },
    savePrefs: 'Enregistrer mes préférences'
  }
  // Add more languages as needed (es, de, it, pt, nl, ru, zh, ja)
} as const;

// Helper: split the long intro into an always-visible part and a collapsible remainder
const splitIntroText = (text: string) => {
  if (!text) return { short: '', more: '' };
  const marker = 'The cookies that are categorised as "Necessary"';
  const idx = text.indexOf(marker);
  if (idx > -1) {
    return {
      short: text.slice(0, idx).trim(),
      more: text.slice(idx).trim()
    };
  }
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= 2) return { short: text, more: '' };
  const short = (sentences[0] + (sentences[1] || '')).trim();
  const more = text.slice(short.length).trim();
  return { short, more };
};

const detectLang = (): keyof typeof defaultTexts => {
  try {
    const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (lang in defaultTexts) return lang as keyof typeof defaultTexts;
    return 'en';
  } catch {
    return 'en';
  }
};

const CookiesBanner: React.FC<CookieBannerProps> = (props) => {
  const {
    display = true,
    backgroundColor = '#111827', // bg-gray-900
    backgroundOpacity = 0.95,
    textColor = '#FFFFFF',
    headerText,
    bodyText,
    policyUrl = '',
    acceptText,
    rejectText,
    customizeText,
    showReject = true,
    className
  } = props || {} as CookieBannerProps;

  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [introExpanded, setIntroExpanded] = React.useState(false);
  const lang = detectLang();
  const t = defaultTexts[lang];

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex; // fallback if hex parsing fails
  };

  React.useEffect(() => {
    if (!display) return;
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [display]);

  if (!display || !visible) return null;

  const handleAccept = () => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ status: 'accepted', at: Date.now() })); } catch { }
    // Emit an event that can be used by scripts to initialize tracking
    try { document.dispatchEvent(new CustomEvent('cookie-consent-accepted')); } catch { }
    // Also support CookieYes-compatible selector
    try {

      // If a global function exists, call it (optional)
      const w: any = window as any;
      if (typeof (w as any).main === 'function') {
        try { (w as any).main((w as any).is_test, (w as any).game_id, (w as any).partner_id); } catch { }
      }
    } catch { }
    setVisible(false);
  };

  const handleReject = () => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ status: 'rejected', at: Date.now() })); } catch { }
    setVisible(false);
  };

  const header = headerText || t.header;
  const body = bodyText || t.body;

  // Compute the intro parts without hooks to avoid hook-order issues with the early return above
  const { short: panelIntroShort, more: panelIntroMore } = splitIntroText(t.panelIntro);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[1000] w-full ${className || ''}`} aria-live="polite" role="dialog" aria-modal="true">
      <div className="w-full">
        <div
          className="shadow-xl overflow-hidden w-full"
          style={{ backgroundColor: hexToRgba(backgroundColor, backgroundOpacity), color: textColor }}
        >
          {/* Compact bar */}
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
            <div className="flex-1 md:pr-8">
              <div className="font-semibold text-base sm:text-lg">{header}</div>
              <p className="text-sm sm:text-[15px] opacity-90 mt-1">
                {body}{' '}
                {policyUrl ? (
                  <a href={policyUrl} target="_blank" rel="noopener noreferrer" className="underline opacity-100 ml-1">
                    {t.policy}
                  </a>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 md:ml-auto">
              {showReject && (
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3 py-2 rounded-md text-xs sm:text-sm border border-white/30 hover:bg-white/10 transition whitespace-nowrap"
                >
                  {rejectText || t.reject}
                </button>
              )}
              <button
                type="button"
                onClick={handleAccept}
                className="cky-btn-accept px-3 py-2 rounded-md text-xs sm:text-sm bg-white text-black font-medium hover:opacity-90 transition whitespace-nowrap"
              >
                {acceptText || t.accept}
              </button>
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="px-3 py-2 rounded-md text-xs sm:text-sm border border-white/30 hover:bg-white/10 transition whitespace-nowrap"
                aria-expanded={open}
                aria-controls="cookies-customize-panel"
              >
                {customizeText || t.customize}
              </button>
            </div>
          </div>

          {/* Expandable panel */}
          {open && (
            <div id="cookies-customize-panel" className="max-h-[30vh] overflow-y-auto border-t border-white/20">
              <div className="p-4 sm:p-5 space-y-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">{t.panelTitle}</div>
                  <p className="opacity-90">
                    {panelIntroShort}
                    {panelIntroMore && !introExpanded ? <span> </span> : null}
                  </p>
                  {panelIntroMore ? (
                    <>
                      {!introExpanded ? (
                        <button
                          type="button"
                          onClick={() => setIntroExpanded(true)}
                          className="underline text-xs sm:text-sm opacity-100"
                          aria-expanded={introExpanded}
                        >
                          {t.showMore}
                        </button>
                      ) : (
                        <>
                          <p className="opacity-90 mt-2">{panelIntroMore}</p>
                          <button
                            type="button"
                            onClick={() => setIntroExpanded(false)}
                            className="underline text-xs sm:text-sm opacity-100 mt-1"
                            aria-expanded={introExpanded}
                          >
                            {t.showLess}
                          </button>
                        </>
                      )}
                    </>
                  ) : null}
                </div>
                {(['necessary', 'functional', 'analytics', 'performance', 'advertisement'] as const).map(key => (
                  <div key={key} className="border border-white/10 rounded-md p-3">
                    <div className="font-medium">{t.categories[key].title}</div>
                    <p className="opacity-80">{t.categories[key].desc}</p>
                  </div>
                ))}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="cky-btn-accept inline-flex px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:opacity-90"
                  >
                    {t.savePrefs}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookiesBanner;
