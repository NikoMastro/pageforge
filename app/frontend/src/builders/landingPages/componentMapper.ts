export function inferComponentName(type: string, props?: any): string | null {
  switch (type.toLowerCase()) {
    case 'background':
      return null;
    case 'widget':
      const widgetType = props?.type;
      if (widgetType === 'install') return 'SteamWidgetCropInstall';
      if (widgetType === 'buy') return 'SteamWidgetCropBuy';
      if (widgetType === 'wishlist') return 'SteamWidgetCropWishlist';
      return 'WidgetFull';
    case 'navbar':
      return 'Navbar';
    case 'hero':
      return 'Hero';
    case 'footer':
      return 'Footer';
    case 'button':
      return 'Button';
    case 'carousel':
      return 'Carousel';
    case 'company-logo':
    case 'companylogo':
      return 'CompanyLogo';
    case 'logotype':
      return 'Logotype';
    default:
      return pascalCase(type);
  }
}

function pascalCase(str: string): string {
  return str.replace(/(^|[-_\s]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());
}
