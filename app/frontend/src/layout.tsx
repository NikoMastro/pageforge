import React from 'react';
import Navigation from './components/layout/navigation';
import { NotificationsProvider } from './components/ui';
import { TopNavigationProvider } from './components/layout/topNavigationContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <NotificationsProvider>
      <div className="h-screen overflow-hidden">
        <div className="flex h-full min-h-0">
          <TopNavigationProvider>
            <Navigation />
            <main className="flex-1 h-full min-h-0 bg-gray-900 relative flex flex-col overflow-hidden">
              <div
                className="absolute inset-0 bg-center opacity-10 blur-sm"
                style={{
                  backgroundImage:
                    'url(https://imagedelivery.net/demo-media-account/deb3ca81-d83f-44c1-e3e3-991122ac5000/public)',
                  backgroundSize: '40% 40%',
                  backgroundRepeat: 'repeat'
                }}
              ></div>
              <div className="h-full min-h-0 relative z-10 flex flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide no-scrollbar">
                  {children}
                </div>
              </div>
            </main>
          </TopNavigationProvider>
        </div>
      </div>
    </NotificationsProvider>
  );
};
