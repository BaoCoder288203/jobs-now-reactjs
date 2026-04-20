import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardTrendPoint } from '@/types/employer-dashboard';
import type { RecruiterTrendMetric } from './DashboardKpiGrid';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardTrendChartProps {
  trend: DashboardTrendPoint[];
  showComparison: boolean;
  selectedMetrics: RecruiterTrendMetric[];
}

interface RecruiterMetricOption {
  key: RecruiterTrendMetric;
  label: string;
  currentKey: keyof DashboardTrendPoint;
  previousKey: keyof DashboardTrendPoint;
  color?: string;
  prevColor?: string;
}

const recruiterMetricOptions: RecruiterMetricOption[] = [
  {
    key: 'followers',
    label: 'Followers',
    currentKey: 'currentFollowers',
    previousKey: 'previousFollowers',
    color: '#2563eb',
    prevColor: '#60a5fa',
  },
  {
    key: 'applications',
    label: 'Đơn ứng tuyển',
    currentKey: 'currentApplications',
    previousKey: 'previousApplications',
    color: '#e11d48',
    prevColor: '#fb7185',
  },
  {
    key: 'reviews',
    label: 'Đánh giá mới',
    currentKey: 'currentReviews',
    previousKey: 'previousReviews',
    color: '#a21caf',
    prevColor: '#d946ef',
  },
  {
    key: 'approvedPosts',
    label: 'Post đã duyệt',
    currentKey: 'currentApprovedPosts',
    previousKey: 'previousApprovedPosts',
    color: '#16a34a',
    prevColor: '#86efac',
  },
  {
    key: 'jobViews',
    label: 'Lượt xem job',
    currentKey: 'currentJobViews',
    previousKey: 'previousJobViews',
    color: '#0f766e',
    prevColor: '#2dd4bf',
  },
  {
    key: 'jobApplies',
    label: 'Apply theo job',
    currentKey: 'currentJobApplies',
    previousKey: 'previousJobApplies',
    color: '#ea580c',
    prevColor: '#fb923c',
  },
  {
    key: 'avgRating',
    label: 'Điểm trung bình',
    currentKey: 'currentAvgRating',
    previousKey: 'previousAvgRating',
    color: '#ca8a04',
    prevColor: '#facc15',
  },
];

export function DashboardTrendChart({ trend, showComparison, selectedMetrics }: DashboardTrendChartProps) {
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
              {recruiterMetricOptions
                .filter((metric) => selectedMetrics.includes(metric.key))
                .map((metric) => (
                  <Line
                    key={`current-${metric.key}`}
                    type="monotone"
                    dataKey={metric.currentKey}
                    name={`${metric.label} hiện tại`}
                    stroke={metric.color ?? '#2563eb'}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              {/* {showComparison &&
                recruiterMetricOptions
                  .filter((metric) => selectedMetrics.includes(metric.key))
                  .map((metric) => (
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
                  ))} */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
