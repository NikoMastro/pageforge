import { useState } from 'react';
import type { NavbarOptions } from '../../types';

export const useNavbarOptions = () => {
  const [navbarOptions, setNavbarOptions] = useState<NavbarOptions>({
    logo: {
      src: '',
      alt: '',
      width: '120px',
      height: 'auto',
    },
    logoUrl: '',
    logoHeight: 40,
    logoPosition: 'start',
    links: [],
    backgroundColor: '#ffffff',
    textColor: '#000000',
    position: 'sticky',
    displayHamburger: false,
    displayNavbarButton: false,
    displayNavbarWidget: false,
    navbarClassName: 'py-4 px-6',
  });

  return { navbarOptions, setNavbarOptions };
};
