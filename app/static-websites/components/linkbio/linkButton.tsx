import React from 'react';

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  platform?: 'steam' | 'epic' | 'playstation' | 'xbox' | 'switch' | 'ios' | 'android' | 'x' | 'discord' | 'instagram' | 'youtube';
  'pf-data-platform'?: string;
  dataLabel?: string;
  className?: string;
  logoUrl?: string;
}

const PlatformIcon: React.FC<{ platform?: string }> = ({ platform }) => {
  const iconClass = "w-12 flex-shrink-0";

  switch (platform) {
    case 'steam':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/3d17b728-bf48-46b7-601c-9cfe12b17800/public"
          alt="Steam"
          className={`${iconClass} brightness-0 invert`}
          loading="lazy"
        />
      );
    case 'epic':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/3ab2d836-0481-43b4-3f8f-6f82b0919c00/public"
          alt="Epic Games"
          className={iconClass}
          loading="lazy"
        />
      );
    case 'playstation':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/38dd9098-48a8-4edc-d7b9-64b72f6fb600/public"
          alt="PlayStation"
          className={iconClass}
          loading="lazy"
        />
      );
    case 'xbox':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/1dd54846-ef75-46ae-82c4-c9888d2c4000/public"
          alt="Xbox"
          className={`${iconClass} brightness-0 invert`}
          loading="lazy"
        />
      );
    case 'switch':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/0f8f7450-49a1-4fe9-2524-ed6ba7543300/public"
          alt="Nintendo Switch"
          className={iconClass}
          loading="lazy"
        />
      );
    case 'ios':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/fb413120-0595-4538-d346-ac327039b700/public"
          alt="iOS"
          className={iconClass}
          loading="lazy"
        />
      );
    case 'android':
      return (
        <img
          src="https://imagedelivery.net/demo-media-account/4df496e9-8cf7-4cac-bc86-f4db66548400/public"
          alt="Android"
          className={iconClass}
          loading="lazy"
        />
      );
    case 'x':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'discord':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
};

const ShareIcon: React.FC = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z" />
  </svg>
);

export const LinkButton: React.FC<LinkButtonProps> = ({ href, children, platform, 'pf-data-platform': pfDataPlatform, dataLabel, className, logoUrl }) => {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: `Check out ${children} link`,
        url: href,
      });
    } else {
      navigator.clipboard.writeText(href).then(() => {
      });
    }
  };

  const baseClassName = `group flex items-center justify-between w-full rounded-2xl px-4 py-3 font-medium bg-slate-800/70 hover:bg-slate-700 transition-colors text-slate-100 text-sm shadow-sm border border-slate-700/50 hover:border-slate-600/50 pf-platform=${platform ?? 'custom'} cursor-pointer`;
  const finalClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <div
      data-pf-platform={pfDataPlatform}
      data-label={dataLabel}
      className={finalClassName}
      data-href={href}
      tabIndex={0}
    >
      {/* Left: Platform Icon or Custom Logo */}
      <div className="flex items-center justify-center w-8">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-12 flex-shrink-0 object-contain" loading="lazy" />
        ) : (
          <PlatformIcon platform={platform} />
        )}
      </div>

      {/* Center: Title */}
      <div className="flex-1 text-center font-medium">
        {children}
      </div>

      {/* Right: Share Icon */}
      <button
        onClick={handleShare}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-600/50 transition-colors opacity-60 group-hover:opacity-100"
        title="Share this link"
        type="button"
      >
        <ShareIcon />
      </button>
    </div>
  );
};

export default LinkButton;
