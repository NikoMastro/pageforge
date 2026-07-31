import React from 'react';
import type { FooterTextProps } from '../../../types';

const FooterText: React.FC<FooterTextProps & { style?: React.CSSProperties }> = ({
  text = 'Default footer text',
  className = '',
  style = {}
}) => {
  return (
    <span
      className={`footer__text footer-text break-words whitespace-pre-line ${className}`}
      style={{ whiteSpace: (style as any)?.whiteSpace ?? 'pre-line', ...style }}
    >
      {text}
    </span>
  );
};

export default FooterText;
