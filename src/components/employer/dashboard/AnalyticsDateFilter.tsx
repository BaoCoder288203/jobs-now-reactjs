import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { DashboardPreset } from '@/types/employer-dashboard';

export interface AnalyticsDateFilterValue {
  preset: DashboardPreset;
  from?: string;
  to?: string;
  comparePrevious: boolean;
}

interface AnalyticsDateFilterProps {
  value: AnalyticsDateFilterValue;
  onChange: (next: AnalyticsDateFilterValue) => void;
}

const presets: Array<{ value: DashboardPreset; label: string }> = [
  { value: 'day', label: 'Ngày' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
  { value: 'custom', label: 'Tùy chọn' },
];

export function AnalyticsDateFilter({ value, onChange }: AnalyticsDateFilterProps) {
  const setPreset = (preset: DashboardPreset) => {
    const resetCustom = preset !== 'custom';
    onChange({
      ...value,
      preset,
      from: resetCustom ? undefined : value.from,
      to: resetCustom ? undefined : value.to,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={item.value === value.preset ? 'default' : 'outline'}
            onClick={() => setPreset(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value.preset === 'custom' && (
          <>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>Từ</span>
              <input
                type="date"
                value={value.from ?? ''}
                onChange={(event) => onChange({ ...value, from: event.target.value || undefined })}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>Đến</span>
              <input
                type="date"
                value={value.to ?? ''}
                onChange={(event) => onChange({ ...value, to: event.target.value || undefined })}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              />
            </label>
          </>
        )}

        <Select
          className="w-full min-w-[180px] sm:w-auto"
          value={value.comparePrevious ? 'yes' : 'no'}
          onChange={(event) =>
            onChange({
              ...value,
              comparePrevious: event.target.value === 'yes',
            })
          }
        >
          <option value="yes">So với kỳ trước</option>
          <option value="no">Không so sánh</option>
        </Select>
      </div>
    </div>
  );
}
