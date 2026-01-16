import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth/RequireAuth';
import { RoleGuard } from '@/auth/roleGuard';

import { HomePage } from '@/pages/public/HomePage';
import { JobListingPage } from '@/pages/public/JobListingPage';
import { JobDetailPage } from '@/pages/public/JobDetailPage';
import { CompanyListingPage } from '@/pages/public/CompanyListingPage';
import { CompanyDetailPage } from '@/pages/public/CompanyDetailPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Job Seeker Pages
import { JobSeekerDashboardPage } from '@/pages/job-seeker/DashboardPage';
import { JobSeekerProfilePage } from '@/pages/job-seeker/ProfilePage';
import { JobSeekerResumesPage } from '@/pages/job-seeker/ResumesPage';
import { JobSeekerApplicationsPage } from '@/pages/job-seeker/ApplicationsPage';
import { JobSeekerSavedJobsPage } from '@/pages/job-seeker/SavedJobsPage';
import { JobSeekerSettingsPage } from '@/pages/job-seeker/SettingsPage';

// Recruiter/Employer Pages
import { RecruiterDashboardPage } from '@/pages/employer/DashboardPage';
import { EmployerJobsPage } from '@/pages/employer/JobsPage';
import { EmployerApplicationsPage } from '@/pages/employer/ApplicationsPage';
import { EmployerApplicationDetailPage } from '@/pages/employer/ApplicationDetailPage';
import { CreateJobPage } from '@/pages/employer/CreateJobPage';
import { EmployerCompanyPage } from '@/pages/employer/CompanyPage';
import { EmployerSettingsPage } from '@/pages/employer/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminCompaniesPage } from '@/pages/admin/CompaniesPage';
import { AdminJobsPage } from '@/pages/admin/JobsPage';
import { AdminSkillsPage } from '@/pages/admin/SkillsPage';

// User Pages (Common for all roles)
import UserPage from '@/pages/user/UserPage';
import UserInfoPage from '@/pages/user/UserInfoPage';
import UserSessionsPage from '@/pages/user/UserSessionsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobListingPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/companies" element={<CompanyListingPage />} />
      <Route path="/companies/:id" element={<CompanyDetailPage />} />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Job Seeker Routes */}
      <Route
        path="/job-seeker/dashboard"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerDashboardPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/job-seeker/profile"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerProfilePage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/job-seeker/resumes"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerResumesPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/job-seeker/applications"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerApplicationsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/job-seeker/saved-jobs"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerSavedJobsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/job-seeker/settings"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerSettingsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />

      {/* Recruiter/Employer Routes */}
      <Route
        path="/employer/dashboard"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <RecruiterDashboardPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <EmployerJobsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/jobs/create"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <CreateJobPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/jobs/:id/edit"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <CreateJobPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/company"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <EmployerCompanyPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/settings"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <EmployerSettingsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/applications"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <EmployerApplicationsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/employer/applications/:id"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['RECRUITER']}>
              <EmployerApplicationDetailPage />
            </RoleGuard>
          </RequireAuth>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminCompaniesPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminJobsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <RequireAuth>
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminSkillsPage />
            </RoleGuard>
          </RequireAuth>
        }
      />

      {/* User Routes (Common for all authenticated users) */}
      <Route
        path="/user"
        element={
          <RequireAuth>
            <UserPage />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="info" replace />} />
        <Route path="info" element={<UserInfoPage />} />
        <Route path="sessions" element={<UserSessionsPage />} />
      </Route>

      {/* Redirect old routes to new structure */}
      <Route path="/recruiter/dashboard" element={<Navigate to="/employer/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

