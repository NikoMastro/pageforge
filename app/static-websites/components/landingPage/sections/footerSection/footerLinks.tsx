import React from "react";
import type { FooterLinksProps } from '../../../types';

const FooterLinks: React.FC<FooterLinksProps> = ({
  links = [],
  separator = '',
  wrapperClass = '',
  linkClass = '',
  hoverClass = 'hover:underline',
  display = true
}) => {
  if (!display || links.length === 0) return null;

  return (
    <div className={`footer-links__wrapper flex flex-wrap gap-2 sm:gap-4 ${wrapperClass}`}>
      {links.map((link, index) => (
        <React.Fragment key={index}>
          <a
            href={link.url}
            target={link.target || '_self'}
            className={`footer-links__link whitespace-normal break-words ${hoverClass} ${linkClass} ${link.className || ''}`}
          >
            {link.text}
          </a>
          {separator && index < links.length - 1 && (
            <span className="footer-links__separator text-gray-400">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FooterLinks;
