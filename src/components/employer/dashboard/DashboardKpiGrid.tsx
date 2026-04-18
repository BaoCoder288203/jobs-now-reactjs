import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardKpis } from '@/types/employer-dashboard';
import { Eye, FileText, Star, UserPlus, Users, BookOpenText, BadgeCheck } from 'lucide-react';

interface DashboardKpiGridProps {
  kpis: DashboardKpis;
}

function formatDelta(deltaPercent: number | null) {
  if (deltaPercent == null) return 'N/A';
  const sign = deltaPercent > 0 ? '+' : '';
  return `${sign}${deltaPercent.toFixed(2)}%`;
}

function formatInteger(num: number) {
  return num.toLocaleString('vi-VN');
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  const avgRating = (kpis.avgRatingX100.value / 100).toFixed(2);
  const items = [
    { key: 'followers', title: 'Followers', value: formatInteger(kpis.followers.value), delta: kpis.followers.deltaPercent, icon: Users },
    { key: 'applications', title: 'Đơn ứng tuyển', value: formatInteger(kpis.applications.value), delta: kpis.applications.deltaPercent, icon: FileText },
    { key: 'reviews', title: 'Đánh giá mới', value: formatInteger(kpis.reviews.value), delta: kpis.reviews.deltaPercent, icon: Star },
    { key: 'approvedPosts', title: 'Post đã duyệt', value: formatInteger(kpis.approvedPosts.value), delta: kpis.approvedPosts.deltaPercent, icon: BadgeCheck },
    { key: 'jobViews', title: 'Lượt xem job', value: formatInteger(kpis.jobViews.value), delta: null, icon: Eye },
    { key: 'jobApplies', title: 'Apply theo job', value: formatInteger(kpis.jobApplies.value), delta: null, icon: UserPlus },
    { key: 'avgRating', title: 'Điểm trung bình', value: avgRating, delta: kpis.avgRatingX100.deltaPercent, icon: BookOpenText },
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
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
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
