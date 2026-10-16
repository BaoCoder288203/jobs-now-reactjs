import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalNotificationListener } from '../common/GlobalNotificationListener';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNotificationListener />
      <Header />
      <main className={showSidebar ? "flex-1 ml-64" : "flex-1"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

