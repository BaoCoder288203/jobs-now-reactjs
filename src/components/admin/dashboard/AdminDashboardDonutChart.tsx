import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutItem {
  label: string;
  value: number;
}

interface AdminDashboardDonutChartProps {
  title: string;
  data: DonutItem[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#e11d48', '#9333ea', '#14b8a6'];

export function AdminDashboardDonutChart({ title, data }: AdminDashboardDonutChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-700">{item.label}</span>
              </div>
              <span className="font-medium text-gray-900">{item.value.toLocaleString('vi-VN')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
