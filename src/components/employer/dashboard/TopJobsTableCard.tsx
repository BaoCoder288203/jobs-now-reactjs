import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardTopJobItem } from '@/types/employer-dashboard';

interface TopJobsTableCardProps {
  data: DashboardTopJobItem[];
}

export function TopJobsTableCard({ data }: TopJobsTableCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Jobs theo hiệu suất</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-3 py-2 font-medium">Tiêu đề</th>
                <th className="px-3 py-2 font-medium">Views</th>
                <th className="px-3 py-2 font-medium">Applies</th>
                <th className="px-3 py-2 font-medium">CVR</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                    Không có dữ liệu trong kỳ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                data.map((job) => (
                  <tr key={job.jobId} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-gray-900">{job.title}</td>
                    <td className="px-3 py-3 text-gray-700">{job.viewCount.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-gray-700">{job.applyCount.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-gray-700">{job.conversionRate.toFixed(2)}%</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          job.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {job.approved ? 'Đã duyệt' : 'Chưa duyệt'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
