import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearAuth, getCurrentUserAsync, setToken } from '@/auth/authSlice';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUserAsync());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.storageArea !== localStorage) return;
      if (e.key !== 'token') return;

      const newToken = e.newValue;
      const prevToken = token ?? null;
      if ((newToken ?? null) === prevToken) return;

      if (!newToken) {
        dispatch(clearAuth());
        return;
      }

      dispatch(setToken(newToken));
      dispatch(getCurrentUserAsync());
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch, token]);

  return <>{children}</>;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthModalProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </AuthModalProvider>
        <Toaster richColors position="top-center" />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}

