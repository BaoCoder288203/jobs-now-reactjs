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
      <div className="flex flex-1">
        {sidebar && sidebar}
        <main className={sidebar ? "flex-1 ml-64" : "flex-1 w-full"}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

