import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <SpeedInsights />
    </AppProviders>
  );
}

export default App;
