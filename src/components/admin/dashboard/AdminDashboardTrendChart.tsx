import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminDashboardTrendPoint } from '@/types/admin-dashboard';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AdminDashboardTrendChartProps {
  trend: AdminDashboardTrendPoint[];
  showComparison: boolean;
}

export function AdminDashboardTrendChart({ trend, showComparison }: AdminDashboardTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Biến động đơn hàng và doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="currentOrderCount" name="Orders hiện tại" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="currentRevenue" name="Doanh thu hiện tại" stroke="#16a34a" strokeWidth={2} dot={false} />
              {showComparison && (
                <>
                  <Line type="monotone" dataKey="previousOrderCount" name="Orders kỳ trước" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                  <Line type="monotone" dataKey="previousRevenue" name="Doanh thu kỳ trước" stroke="#86efac" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
