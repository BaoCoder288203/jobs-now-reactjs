import { Link } from 'react-router-dom';
import type { Job } from '@/types';
import { MapPin, DollarSign, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatSalaryTriệu(job: Job): string {
  if (!job.salary_min && !job.salary_max) return 'Thỏa thuận';
  const min = job.salary_min ? job.salary_min / 1_000_000 : null;
  const max = job.salary_max ? job.salary_max / 1_000_000 : null;
  if (min != null && max != null) return `${min} - ${max} triệu`;
  if (min != null) return `Từ ${min} triệu`;
  if (max != null) return `Đến ${max} triệu`;
  return 'Thỏa thuận';
}

function shortLocation(loc?: string): string {
  if (!loc) return '—';
  const parts = loc.split(',');
  const last = parts[parts.length - 1]?.trim();
  return last || loc;
}

export interface RelatedJobCardProps {
  job: Job;
  className?: string;
}

export function RelatedJobCard({ job, className }: RelatedJobCardProps) {
  const salary = formatSalaryTriệu(job);
  const region = shortLocation(job.location);

  return (
    <li>
      <Link
        to={`/jobs/${job.id}`}
        className={cn(
          'group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all',
          'hover:border-sky-300 hover:shadow-md',
          className
        )}
      >
        <div className="flex w-[72px] shrink-0 flex-col items-center gap-2">
          <div className="flex h-14 w-full items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-1.5">
            {job.company?.logo_url ?
              <img
                src={job.company.logo_url}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            : <Building2 className="h-7 w-7 text-gray-300" />}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-indigo-950 group-hover:text-sky-800">
            {job.title}
          </p>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {job.company?.name ?? '—'}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
            <span className="line-clamp-1">{region}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-sm font-semibold text-sky-600">
            <DollarSign className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
            <span>{salary}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
