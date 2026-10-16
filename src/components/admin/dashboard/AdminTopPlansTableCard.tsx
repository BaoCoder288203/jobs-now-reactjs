import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminDashboardTopPlanItem } from '@/types/admin-dashboard';

interface AdminTopPlansTableCardProps {
  data: AdminDashboardTopPlanItem[];
}

export function AdminTopPlansTableCard({ data }: AdminTopPlansTableCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top gói theo doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-3 py-2 font-medium">Gói</th>
                <th className="px-3 py-2 font-medium">Scope</th>
                <th className="px-3 py-2 font-medium">Orders</th>
                <th className="px-3 py-2 font-medium">Paid orders</th>
                <th className="px-3 py-2 font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                    Không có dữ liệu gói trong kỳ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                data.map((plan) => (
                  <tr key={`${plan.planId}-${plan.planName}`} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-gray-900">{plan.planName}</td>
                    <td className="px-3 py-3 text-gray-700">{plan.scope}</td>
                    <td className="px-3 py-3 text-gray-700">{plan.orders.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-gray-700">{plan.paidOrders.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-gray-900">{plan.revenue.toLocaleString('vi-VN')}đ</td>
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
