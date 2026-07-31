import React, { useState } from 'react';
import styled from '@emotion/styled';

// Simple fallback icons
const MenuIcon = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface NavLink {
  id: string;
  text: string;
  // Either a URL or a section anchor (e.g., #features). Section can also be provided via sectionId.
  url?: string;
  sectionId?: string;
  target?: '_self' | '_blank';
}

interface HamburgerProps {
  links?: NavLink[];
  onLinkClick?: (link: NavLink) => void;
}

const HamburgerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const HamburgerIcon = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

const NavMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 10px 0;
  margin-top: 10px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s ease;
  z-index: 100;
`;

const NavItem = styled.a`
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Hamburger: React.FC<HamburgerProps> = ({
  links = [
    { id: '1', text: 'Link 1', url: '#' },
    { id: '2', text: 'Link 2', url: '#' },
    { id: '3', text: 'Link 3', url: '#' }
  ],
  onLinkClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (link: NavLink) => {
    // Determine if this is a section redirect
    const isSection = !!link.sectionId || (link.url?.startsWith('#') ?? false);
    if (isSection) {
      const raw = link.sectionId || link.url || '';
      const id = raw.startsWith('#') ? raw.slice(1) : raw;
      const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof history !== 'undefined') {
            history.pushState(null, '', `#${id}`);
          }
        } catch {
          // no-op
        }
      }
    } else if (link.url) {
      // External or page navigation
      if (link.target === '_blank') {
        window.open(link.url, '_blank');
      } else {
        window.location.href = link.url;
      }
    }

    if (onLinkClick) onLinkClick(link);
    setIsOpen(false);
  };

  return (
    <HamburgerContainer>
      <HamburgerIcon isOpen={isOpen} onClick={toggleMenu}>
        {isOpen ? (
          <CloseIcon width={24} height={24} />
        ) : (
          <MenuIcon width={24} height={24} />
        )}
      </HamburgerIcon>

      <NavMenu isOpen={isOpen}>
        {links.map((link) => (
          <NavItem
            key={link.id}
            href={link.url || (link.sectionId ? `#${link.sectionId}` : '#')}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(link);
            }}
          >
            {link.text}
          </NavItem>
        ))}
      </NavMenu>
    </HamburgerContainer>
  );
};

export default Hamburger;
