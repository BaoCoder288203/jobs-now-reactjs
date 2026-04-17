import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardRatingDistributionItem } from '@/types/employer-dashboard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardRatingBarChartProps {
  data: DashboardRatingDistributionItem[];
}

export function DashboardRatingBarChart({ data }: DashboardRatingBarChartProps) {
  const chartData = data.map((item) => ({ star: `${item.star}★`, count: item.count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Phân bổ đánh giá theo sao</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="star" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
