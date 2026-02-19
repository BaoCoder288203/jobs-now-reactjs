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

  const userRoleName = user.role?.name?.toUpperCase() || '';
  const normalizedRole = userRoleName.replace(' ', '_');
  
  if (!allowedRoles.includes(normalizedRole)) {
    const roleName = user.role?.name?.toLowerCase().replace('_', '-') || 'user';
    const dashboardPath = roleName === 'job-seeker' ? '/user/dashboard' : `/${roleName}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

