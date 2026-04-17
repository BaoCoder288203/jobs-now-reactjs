import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminDashboardKpis } from '@/types/admin-dashboard';
import { Building2, Briefcase, CreditCard, DollarSign, Layers3, Users } from 'lucide-react';

interface AdminDashboardKpiGridProps {
  kpis: AdminDashboardKpis;
}

function formatDelta(deltaPercent: number | null) {
  if (deltaPercent == null) return 'N/A';
  const sign = deltaPercent > 0 ? '+' : '';
  return `${sign}${deltaPercent.toFixed(2)}%`;
}

export function AdminDashboardKpiGrid({ kpis }: AdminDashboardKpiGridProps) {
  const items = [
    { key: 'totalUsers', title: 'Tổng người dùng', value: kpis.totalUsers.value, delta: kpis.totalUsers.deltaPercent, icon: Users },
    { key: 'totalCompanies', title: 'Tổng công ty', value: kpis.totalCompanies.value, delta: kpis.totalCompanies.deltaPercent, icon: Building2 },
    { key: 'totalJobs', title: 'Tổng việc làm', value: kpis.totalJobs.value, delta: kpis.totalJobs.deltaPercent, icon: Briefcase },
    { key: 'activePlans', title: 'Gói đang active', value: kpis.activePlans.value, delta: kpis.activePlans.deltaPercent, icon: Layers3 },
    { key: 'paidOrders', title: 'Đơn đã thanh toán', value: kpis.paidOrders.value, delta: kpis.paidOrders.deltaPercent, icon: CreditCard },
    { key: 'paidRevenue', title: 'Doanh thu', value: kpis.paidRevenue.value, delta: kpis.paidRevenue.deltaPercent, icon: DollarSign, isCurrency: true },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const positive = (item.delta ?? 0) >= 0;
        return (
          <Card key={item.key} className="hover:shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {item.isCurrency ? item.value.toLocaleString('vi-VN') + 'đ' : item.value.toLocaleString('vi-VN')}
              </div>
              <p className={`mt-1 text-xs ${item.delta == null ? 'text-gray-500' : positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatDelta(item.delta)}
              </p>
              <p className="text-xs text-gray-500">So với kỳ trước</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
