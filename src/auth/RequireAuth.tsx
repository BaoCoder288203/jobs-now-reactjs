import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, token, user } = useAppSelector((state) => state.auth);

  const isHydratingAuth = Boolean(token) && !user;

  if (isLoading || isHydratingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

