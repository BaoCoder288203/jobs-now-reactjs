import { Link } from 'react-router-dom';
import type { Company } from '@/types';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
  className?: string;
}

export function CompanyCard({ company, jobCount = 0, className }: CompanyCardProps) {
  const bannerImage = company.thumbnail_images?.[0] ?? company.banner_url;

  return (
    <Link
      to={`/companies/${company.id}`}
      className={cn(
        'block bg-white rounded-xl overflow-hidden h-full hover:shadow-lg transition-shadow border border-gray-200 p-2.5',
        className
      )}
    >
      {/* Banner Section */}
      {bannerImage && (
        <div
          className="relative h-[min(50vh,100px)] bg-cover bg-center rounded-lg"
          style={{
            backgroundImage: `url(${bannerImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/20 rounded-lg" />
        </div>
      )}

      {/* Logo + Name cùng hàng */}
      <div className={cn('relative flex items-center gap-3 px-2 pt-2', bannerImage ? '-mt-4' : 'pt-2')}>
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow shrink-0 overflow-hidden">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100" />
          )}
        </div>
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 min-w-0 flex-1">
          {company.name}
        </h2>
      </div>

      {/* Actions */}
      <div className="px-2 pb-2 pt-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium bg-[#81d1f3]/10 border border-[#81d1f3]/30 text-[#81d1f3]">
            View company
          </span>
          {jobCount > 0 && (
            <Link
              to={`/jobs?company_id=${company.id}`}
              className="text-xs text-gray-600 hover:underline font-medium ml-auto flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}
