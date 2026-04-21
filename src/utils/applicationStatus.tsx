import { Badge } from '@/components/ui/badge';

export const APPLICATION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Đang chờ' },
  { value: 'reviewing', label: 'Đang xem xét' },
  { value: 'shortlisted', label: 'Đạt vòng hồ sơ' },
  { value: 'interviewing', label: 'Phỏng vấn' },
  { value: 'rejected', label: 'Đã từ chối' },
  { value: 'hired', label: 'Đã tuyển' },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Đang chờ', className: 'bg-gray-100 text-gray-700' },
  REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-800' },
  SHORTLISTED: { label: 'Đạt vòng hồ sơ', className: 'bg-green-100 text-green-800' },
  INTERVIEWING: { label: 'Phỏng vấn', className: 'bg-purple-100 text-purple-800' },
  REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
  HIRED: { label: 'Đã tuyển', className: 'bg-emerald-600 text-white' },
};

export function getApplicationStatusLabel(status: string): string {
  const normalized = (status ?? '').toUpperCase();
  return STATUS_MAP[normalized]?.label ?? status;
}

export function getApplicationStatusBadge(status: string) {
  const normalized = (status ?? '').toUpperCase();
  const info = STATUS_MAP[normalized] ?? STATUS_MAP.PENDING;
  return (
    <Badge className={info.className}>
      {info.label}
    </Badge>
  );
}
