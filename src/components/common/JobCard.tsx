import { Link } from 'react-router-dom';
import type { Job } from '@/types';
import { MapPin } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { openLoginModal } = useAuthModal();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Mức lương không tiết lộ';
    if (!job.salary_min || !job.salary_max) return 'Mức lương không tiết lộ';
    return `${(job.salary_min / 1_000_000).toFixed(1)} - ${(job.salary_max / 1_000_000).toFixed(1)} triệu`;
  };

  const hasThumb = !!job.thumbnail_url;

  return (
    <Link to={`/jobs/${job.id}`} className={cn('block h-full', className)}>
      <article
        className={cn(
          'relative h-full min-h-[320px] rounded-xl overflow-hidden',
          'flex flex-col justify-between p-6',
          'hover:shadow-xl transition-all duration-200 cursor-pointer',
          hasThumb ? 'bg-cover bg-center bg-no-repeat' : 'bg-white/65'
        )}
        style={
          hasThumb
            ? { backgroundImage: `url(${job.thumbnail_url})` }
            : undefined
        }
      >
        {/* Overlay tối chỉ khi có thumbnail (để chữ trắng đọc rõ) */}
        {hasThumb && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40 pointer-events-none"
            aria-hidden
          />
        )}

        <div className="relative z-10 flex flex-col items-center text-center flex-1">
          {/* Logo công ty - vòng tròn nền trắng */}
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 mb-3">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200" />
            )}
          </div>

          {/* Tên công ty */}
          <h3
            className={cn(
              'text-lg font-bold mb-1 line-clamp-1',
              hasThumb ? 'text-white' : 'text-gray-900'
            )}
          >
            {job.company?.name ?? 'Công ty'}
          </h3>

          {/* Mô tả công ty (snippet) */}
          {job.company?.description && (
            <p
              className={cn(
                'text-sm line-clamp-2 mb-3 max-w-full',
                hasThumb ? 'text-white/90' : 'text-gray-600'
              )}
            >
              {job.company.description}
            </p>
          )}

          {/* Job title - nổi bật */}
          <h2
            className={cn(
              'text-2xl font-bold mt-auto mb-4 line-clamp-2',
              hasThumb ? 'text-white' : 'text-gray-900'
            )}
          >
            {job.title}
          </h2>
        </div>

        {/* Salary */}
        <div className="relative z-10 mt-2 text-center">
          {isAuthenticated ? (
            <p
              className={cn(
                'text-sm font-medium',
                hasThumb ? 'text-white' : 'text-gray-800'
              )}
            >
              {formatSalary()}
            </p>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openLoginModal('job_seeker');
              }}
              className="text-sm font-semibold text-[#0ea5e9] hover:text-[#38bdf8] hover:underline focus:outline-none"
            >
              Đăng nhập để xem lương
            </button>
          )}
        </div>

        {/* Location */}
        {job.location && (
          <div
            className={cn(
              'relative z-10 flex items-center gap-1.5 mt-2 text-sm',
              hasThumb ? 'text-white' : 'text-gray-700'
            )}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{job.location}</span>
          </div>
        )}

        {/* Benefits - dưới địa chỉ */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="relative z-10 mt-2 flex flex-wrap gap-1.5 justify-center">
            {job.benefits.slice(0, 4).map((b, i) => (
              <span
                key={i}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-md border',
                  hasThumb
                    ? 'text-white/90 border-white/40 bg-white/10'
                    : 'text-gray-600 border-gray-300 bg-gray-50'
                )}
              >
                {b}
              </span>
            ))}
            {job.benefits.length > 4 && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5',
                  hasThumb ? 'text-white/70' : 'text-gray-500'
                )}
              >
                +{job.benefits.length - 4}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
