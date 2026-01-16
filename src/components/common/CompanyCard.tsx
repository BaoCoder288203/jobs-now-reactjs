import { Link } from 'react-router-dom';
import type { Company } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, CheckCircle2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  return (
    <Link to={`/companies/${company.id}`}>
      <Card className={cn("hover:shadow-lg transition-all duration-200 cursor-pointer h-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {company.name}
                </h3>
              </div>
              {company.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {company.description.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {company.website && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="truncate">{company.website}</span>
              </div>
            )}
            {company.company_size && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {company.company_size}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

