export type DashboardPreset = 'day' | 'month' | 'year' | 'custom';

export interface DashboardMetricsQuery {
  preset: DashboardPreset;
  from?: string;
  to?: string;
  tz?: string;
  comparePrevious?: boolean;
}

export interface DashboardRangeInfo {
  preset: DashboardPreset;
  bucket: 'hour' | 'day' | 'week' | 'month';
  timezone: string;
  from: string;
  to: string;
}

export interface DashboardKpiValue {
  value: number;
  deltaPercent: number | null;
}

export interface DashboardKpis {
  followers: DashboardKpiValue;
  reviews: DashboardKpiValue;
  approvedPosts: DashboardKpiValue;
  applications: DashboardKpiValue;
  avgRatingX100: DashboardKpiValue;
  jobViews: DashboardKpiValue;
  jobApplies: DashboardKpiValue;
}

export interface DashboardTrendPoint {
  label: string;
  currentFollowers: number;
  previousFollowers: number;
  currentApplications: number;
  previousApplications: number;
  currentReviews: number;
  previousReviews: number;
  currentApprovedPosts: number;
  previousApprovedPosts: number;
  currentJobViews: number;
  previousJobViews: number;
  currentJobApplies: number;
  previousJobApplies: number;
  currentAvgRating: number;
  previousAvgRating: number;
}

export interface DashboardRatingDistributionItem {
  star: number;
  count: number;
}

export interface DashboardStatusCountItem {
  status: string;
  count: number;
}

export interface DashboardTopJobItem {
  jobId: number;
  title: string;
  viewCount: number;
  applyCount: number;
  conversionRate: number;
  active: boolean;
  approved: boolean;
}

export interface EmployerDashboardMetrics {
  range: DashboardRangeInfo;
  kpis: DashboardKpis;
  trend: DashboardTrendPoint[];
  ratingDistribution: DashboardRatingDistributionItem[];
  applicationPipeline: DashboardStatusCountItem[];
  postStatus: DashboardStatusCountItem[];
  topJobs: DashboardTopJobItem[];
}
