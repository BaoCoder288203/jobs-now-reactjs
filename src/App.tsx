import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/routes';
import { SupportWidget } from '@/components/support/SupportWidget';
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <SupportWidget />
      <SpeedInsights />
    </AppProviders>
  );
}

export default App;
