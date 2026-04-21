import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);

  const isHydratingAuth = Boolean(token) && !user;

  if (isLoading || isHydratingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.role || '';

  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'ROLE_JOBSEEKER') {
      return <Navigate to="/user/dashboard" replace />;
    } else if (userRole === 'ROLE_COMPANY') {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

