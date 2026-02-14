import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth/RequireAuth';
import { RoleGuard } from '@/auth/roleGuard';

import { HomePage } from '@/pages/public/HomePage';
import { JobListingPage } from '@/pages/public/JobListingPage';
import { JobDetailPage } from '@/pages/public/JobDetailPage';
import { CompanyListingPage } from '@/pages/public/CompanyListingPage';
import { CompanyDetailPage } from '@/pages/public/CompanyDetailPage';
import { ToolsPlaceholderPage } from '@/pages/public/ToolsPlaceholderPage';
import { CVToolsLandingPage } from '@/pages/public/CVToolsLandingPage';
import { CVBuilderPage } from '@/pages/public/CVBuilderPage';

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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobListingPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/companies" element={<CompanyListingPage />} />
      <Route path="/companies/:id" element={<CompanyDetailPage />} />

      {/* Tools (CV landing + builder) */}
      <Route path="/tools/tao-cv/builder" element={<CVBuilderPage />} />
      <Route path="/tools/tao-cv" element={<CVToolsLandingPage />} />
      <Route path="/tools/chuan-hoa-cv" element={<CVToolsLandingPage />} />
      {/* Tools (placeholder) */}
      <Route path="/tools/tinh-luong-gross-net" element={<ToolsPlaceholderPage />} />
      <Route path="/tools/phong-van" element={<ToolsPlaceholderPage />} />

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

        {/* Job Seeker specific routes - only accessible for JOB_SEEKER role */}
        <Route
          path="dashboard"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerDashboardPage />
            </RoleGuard>
          }
        />
        <Route
          path="profile"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerProfilePage />
            </RoleGuard>
          }
        />
        <Route
          path="applications"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerApplicationsPage />
            </RoleGuard>
          }
        />
        <Route
          path="resumes"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerResumesPage />
            </RoleGuard>
          }
        />
        <Route
          path="saved-jobs"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerSavedJobsPage />
            </RoleGuard>
          }
        />
        <Route
          path="settings"
          element={
            <RoleGuard allowedRoles={['JOB_SEEKER']}>
              <JobSeekerSettingsPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Redirect old routes to new structure */}
      <Route path="/recruiter/dashboard" element={<Navigate to="/employer/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

