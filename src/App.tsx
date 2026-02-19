import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/routes';
import { SupportWidget } from '@/components/support/SupportWidget';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <SupportWidget />
    </AppProviders>
  );
}

export default App;
