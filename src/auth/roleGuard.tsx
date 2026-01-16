import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRoleName = user.role?.name?.toUpperCase() || '';
  // Normalize role name: 'job_seeker' -> 'JOB_SEEKER', 'recruiter' -> 'RECRUITER'
  const normalizedRole = userRoleName.replace(' ', '_');
  
  if (!allowedRoles.includes(normalizedRole)) {
    const roleName = user.role?.name?.toLowerCase().replace('_', '-') || 'user';
    return <Navigate to={`/${roleName}/dashboard`} replace />;
  }

  return <>{children}</>;
}

