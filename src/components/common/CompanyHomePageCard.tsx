import { Link } from 'react-router-dom';
import type { Company } from '@/types';
import { Briefcase, Crown, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyTopCardProps {
  company: Company;
  className?: string;
}

export function CompanyTopCard({ company, className }: CompanyTopCardProps) {
  const category = company.category ?? (company.industries?.map((i) => i.name).join(', ') || company.industry?.name) ?? 'Công ty';
  const jobCount = company.create_job_count ?? 0;
  const priorityLevel = company.priority_level ?? 0;

  return (
    <Link to={`/companies/${company.id}`} className={cn('block h-full', className)}>
      <article
        className={cn(
          'relative overflow-hidden rounded-xl p-4 flex gap-4 transition-all duration-300 cursor-pointer h-full group',
          priorityLevel === 3 
            ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-amber-200 shadow-md hover:shadow-xl hover:shadow-amber-200/50 hover:-translate-y-1' 
            : priorityLevel === 2 
              ? 'bg-gradient-to-b from-[#EBF0FA] to-blue-50/50 border border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5' 
              : 'bg-[#EBF0FA] border border-transparent hover:shadow-md hover:-translate-y-0.5'
        )}
      >
        {/* Shimmer Effect for VIP on hover */}
        {priorityLevel === 3 && (
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite] transition-transform duration-1000 ease-in-out group-hover:translate-x-full z-10" />
        )}
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
            <span className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-700 max-w-[240px] truncate">
              {category}
            </span>
          </div>

          {/* Middle: Name + Slogan */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                {company.name}
              </h3>
              {priorityLevel === 3 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-gradient-to-r from-amber-200 to-yellow-400 shadow-sm whitespace-nowrap">
                  <Crown className="h-3.5 w-3.5" />
                  Top Employer
                </span>
              )}
              {priorityLevel === 2 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 whitespace-nowrap">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
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
