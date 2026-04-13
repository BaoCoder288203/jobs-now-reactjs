import type { ReactNode } from 'react';
import { Header } from './Header';
import { GlobalNotificationListener } from '../common/GlobalNotificationListener';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  showHeader?: boolean;
}

export function DashboardLayout({ 
  children, 
  sidebar,
  showHeader = false 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <GlobalNotificationListener />
      {showHeader && <Header />}
      <div className="flex min-h-0 min-w-0 flex-1">
        {sidebar && sidebar}
        <main
          className={
            sidebar ? 'ml-64 min-h-0 min-w-0 flex-1 max-w-full' : 'min-h-0 min-w-0 w-full max-w-full flex-1'
          }
        >
          <div className="min-w-0 max-w-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

