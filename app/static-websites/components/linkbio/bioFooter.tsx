import React from 'react';

// Local minimal type for footer props
interface FooterLink { label?: string; url: string; }
interface FooterConfig {
  privacyUrl?: string;
  termsUrl?: string;
  custom?: FooterLink[];
  order?: string[]; // Array of footer link names defining order: ['privacy', 'terms', 'custom-0', etc.]
}
interface BioFooterProps { footer: FooterConfig; }

export const BioFooter: React.FC<BioFooterProps> = ({ footer }) => {
  const custom = footer?.custom || [];

  // Create footer elements map
  const elementMap: Record<string, React.ReactNode> = {};

  if (footer?.privacyUrl) {
    elementMap.privacy = (
      <a key="privacy" className="hover:text-slate-200 transition-colors pf-platform=privacy" href={footer.privacyUrl} target="_blank" rel="noopener">
        Privacy
      </a>
    );
  }

  if (footer?.termsUrl) {
    elementMap.terms = (
      <a key="terms" className="hover:text-slate-200 transition-colors pf-platform=terms" href={footer.termsUrl} target="_blank" rel="noopener">
        Terms
      </a>
    );
  }

  custom.forEach((c, i) => {
    elementMap[`custom-${i}`] = (
      <a key={`custom-${i}`} className={`hover:text-slate-200 transition-colors pf-platform-${(c.label || 'link').toLowerCase().replace(/\s+/g, '-')}`} href={c.url} target="_blank" rel="noopener">
        {c.label || 'Link'}
      </a>
    );
  });

  if (Object.keys(elementMap).length === 0) return null;

  // Apply ordering if specified
  let orderedElements: React.ReactNode[];
  if (footer?.order && footer.order.length > 0) {
    orderedElements = [];
    footer.order.forEach(itemName => {
      if (elementMap[itemName]) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    // Add any remaining elements not in the order (fallback)
    Object.keys(elementMap).forEach(itemName => {
      if (!footer.order!.includes(itemName)) {
        orderedElements.push(elementMap[itemName]);
      }
    });
  } else {
    // Default order: privacy, terms, custom items
    orderedElements = Object.values(elementMap);
  }

  return (
    <footer className="mt-4 text-center text-xs text-slate-400">
      {orderedElements.map((element, index) => (
        <React.Fragment key={index}>
          {element}
          {index < orderedElements.length - 1 && <span className="mx-2 opacity-50">•</span>}
        </React.Fragment>
      ))}
    </footer>
  );
};

export default BioFooter;
