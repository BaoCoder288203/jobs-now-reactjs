import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface RatingDistributionItem {
  rating: number;
  percent: number;
}

interface OverallRatingChartsProps {
  averageRating: number;
  totalReviews: number;
  recommendPercent: number;
  distribution: RatingDistributionItem[];
}

export function OverallRatingCharts({
  averageRating,
  totalReviews,
  recommendPercent,
  distribution,
}: OverallRatingChartsProps) {
  const barData = distribution.map((item) => ({
    label: `${item.rating}`,
    percent: item.percent,
  }));

  const pieData = [
    { name: 'Recommend', value: recommendPercent },
    { name: 'Other', value: Math.max(0, 100 - recommendPercent) },
  ];

  return (
    <div className="rounded-xl border border-gray-200 p-5 md:p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Overall rating</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_260px] gap-6 items-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="mt-2 text-lg font-semibold text-gray-800">{totalReviews} reviews</div>
        </div>

        <div className="space-y-2">
          {barData.map((item, index) => (
            <div key={`row-${index}`} className="grid grid-cols-[36px_1fr_44px] items-center gap-3">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span>{item.label}</span>
                <span className="text-amber-400">★</span>
              </div>

              <div className="h-3 rounded-full bg-[#f3ece3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <div className="text-sm font-semibold text-gray-700 text-right">{item.percent}%</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 justify-center lg:justify-start border-l border-black/10 pl-6">
          <div className="h-28 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={32}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="text-2xl font-bold text-green-600">{recommendPercent}%</p>
            <p className="text-gray-800 leading-snug">
              Recommend working
              <br />
              here to a friend
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
