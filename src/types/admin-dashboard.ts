export type AdminDashboardPreset = 'day' | 'month' | 'year' | 'custom';

export interface AdminDashboardMetricsQuery {
  preset: AdminDashboardPreset;
  from?: string;
  to?: string;
  tz?: string;
  comparePrevious?: boolean;
}

export interface AdminDashboardRangeInfo {
  preset: AdminDashboardPreset;
  bucket: 'hour' | 'day' | 'week' | 'month';
  timezone: string;
  from: string;
  to: string;
}

export interface AdminDashboardKpiValue {
  value: number;
  deltaPercent: number | null;
}

export interface AdminDashboardKpis {
  totalUsers: AdminDashboardKpiValue;
  totalCompanies: AdminDashboardKpiValue;
  totalJobs: AdminDashboardKpiValue;
  paidOrders: AdminDashboardKpiValue;
  paidRevenue: AdminDashboardKpiValue;
  activePlans: AdminDashboardKpiValue;
}

export interface AdminDashboardTrendPoint {
  label: string;
  currentOrderCount: number;
  currentRevenue: number;
  previousOrderCount: number;
  previousRevenue: number;
  currentTotalUsers: number;
  previousTotalUsers: number;
  currentTotalCompanies: number;
  previousTotalCompanies: number;
  currentTotalJobs: number;
  previousTotalJobs: number;
  currentActivePlans: number;
  previousActivePlans: number;
}

export interface AdminDashboardStatusCountItem {
  status: string;
  count: number;
}

export interface AdminDashboardScopeCountItem {
  scope: string;
  orders: number;
  revenue: number;
}

export interface AdminDashboardTopPlanItem {
  planId: number | null;
  planName: string;
  scope: string;
  orders: number;
  paidOrders: number;
  revenue: number;
}

export interface AdminDashboardMetrics {
  range: AdminDashboardRangeInfo;
  kpis: AdminDashboardKpis;
  trend: AdminDashboardTrendPoint[];
  orderStatusDistribution: AdminDashboardStatusCountItem[];
  scopeDistribution: AdminDashboardScopeCountItem[];
  topPlans: AdminDashboardTopPlanItem[];
}
