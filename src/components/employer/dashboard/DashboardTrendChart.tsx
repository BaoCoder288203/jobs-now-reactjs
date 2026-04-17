import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardTrendPoint } from '@/types/employer-dashboard';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardTrendChartProps {
  trend: DashboardTrendPoint[];
  showComparison: boolean;
}

export function DashboardTrendChart({ trend, showComparison }: DashboardTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Biến động traffic theo kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="currentFollowers" name="Followers hiện tại" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="currentApplications" name="Applications hiện tại" stroke="#e11d48" strokeWidth={2} dot={false} />
              {showComparison && (
                <>
                  <Line type="monotone" dataKey="previousFollowers" name="Followers kỳ trước" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                  <Line type="monotone" dataKey="previousApplications" name="Applications kỳ trước" stroke="#fb7185" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
