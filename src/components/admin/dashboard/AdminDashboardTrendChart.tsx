import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminDashboardTrendPoint } from '@/types/admin-dashboard';
import type { AdminTrendMetric } from './AdminDashboardKpiGrid';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AdminDashboardTrendChartProps {
  trend: AdminDashboardTrendPoint[];
  showComparison: boolean;
  selectedMetrics: AdminTrendMetric[];
}

interface AdminMetricOption {
  key: AdminTrendMetric;
  label: string;
  currentKey: keyof AdminDashboardTrendPoint;
  previousKey: keyof AdminDashboardTrendPoint;
  color?: string;
  prevColor?: string;
}

const adminMetricOptions: AdminMetricOption[] = [
  {
    key: 'totalUsers',
    label: 'Tổng người dùng',
    currentKey: 'currentTotalUsers',
    previousKey: 'previousTotalUsers',
    color: '#7c3aed',
    prevColor: '#a78bfa',
  },
  {
    key: 'totalCompanies',
    label: 'Tổng công ty',
    currentKey: 'currentTotalCompanies',
    previousKey: 'previousTotalCompanies',
    color: '#ea580c',
    prevColor: '#fb923c',
  },
  {
    key: 'totalJobs',
    label: 'Tổng việc làm',
    currentKey: 'currentTotalJobs',
    previousKey: 'previousTotalJobs',
    color: '#0891b2',
    prevColor: '#22d3ee',
  },
  {
    key: 'activePlans',
    label: 'Gói có thanh toán',
    currentKey: 'currentActivePlans',
    previousKey: 'previousActivePlans',
    color: '#ca8a04',
    prevColor: '#facc15',
  },
  {
    key: 'paidOrders',
    label: 'Đơn đã thanh toán',
    currentKey: 'currentOrderCount',
    previousKey: 'previousOrderCount',
    color: '#2563eb',
    prevColor: '#60a5fa',
  },
  {
    key: 'paidRevenue',
    label: 'Doanh thu',
    currentKey: 'currentRevenue',
    previousKey: 'previousRevenue',
    color: '#16a34a',
    prevColor: '#86efac',
  },
];

export function AdminDashboardTrendChart({ trend, showComparison, selectedMetrics }: AdminDashboardTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Biến động theo kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {adminMetricOptions
                .filter((metric) => selectedMetrics.includes(metric.key))
                .map((metric) =>
                  <Line
                    key={`current-${metric.key}`}
                    type="monotone"
                    dataKey={metric.currentKey}
                    name={`${metric.label} hiện tại`}
                    stroke={metric.color ?? '#2563eb'}
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              {/* {showComparison &&
                adminMetricOptions
                  .filter((metric) => selectedMetrics.includes(metric.key))
                  .map((metric) =>
                    <Line
                      key={`previous-${metric.key}`}
                      type="monotone"
                      dataKey={metric.previousKey}
                      name={`${metric.label} kỳ trước`}
                      stroke={metric.prevColor ?? '#93c5fd'}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  )} */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
