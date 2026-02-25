import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

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

