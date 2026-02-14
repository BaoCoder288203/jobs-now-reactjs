import { Link } from 'react-router-dom';
import type { Company } from '@/types';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyTopCardProps {
  company: Company;
  className?: string;
}

export function CompanyTopCard({ company, className }: CompanyTopCardProps) {
  const category = company.category ?? company.industry?.name ?? 'Công ty';
  const jobCount = company.create_job_count ?? 0;

  return (
    <Link to={`/companies/${company.id}`} className={cn('block h-full', className)}>
      <article
        className={cn(
          'bg-[#EBF0FA] rounded-xl p-4 flex gap-4',
          'hover:shadow-lg transition-all duration-200 cursor-pointer h-full'
        )}
      >
        {/* Left: Visuals - Logo + 2 Thumbnails */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* Logo - white container */}
          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100" />
            )}
          </div>

          {/* 2 Thumbnails - side by side */}
          {company.thumbnail_images && company.thumbnail_images.length > 0 && (
            <div className="flex gap-2">
              {company.thumbnail_images[0] && (
                <img
                  src={company.thumbnail_images[0]}
                  alt={`${company.name} activity 1`}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              {company.thumbnail_images[1] && (
                <img
                  src={company.thumbnail_images[1]}
                  alt={`${company.name} activity 2`}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* Right: Information */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Top: Category tag - góc trên phải */}
          <div className="flex justify-end mb-2 shrink-0">
            <span className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-700 whitespace-nowrap">
              {category}
            </span>
          </div>

          {/* Middle: Name + Slogan */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {company.name}
            </h3>
            {company.slogan && (
              <p className="text-sm text-gray-700 line-clamp-1">
                {company.slogan}
              </p>
            )}
          </div>

          {/* Bottom: Job count - góc dưới phải */}
          <div className="flex items-center gap-1.5 text-sm text-gray-700 mt-2 shrink-0">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">
              {jobCount} {jobCount === 1 ? 'job' : 'jobs'} opening
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
