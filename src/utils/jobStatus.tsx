import { Badge } from '@/components/ui/badge';
import type { Job } from '@/types';

export function getJobStatusBadge(job: Job) {
  if (job.isDeleted) return <Badge className="bg-gray-500 text-white">Đã xóa</Badge>;
  if (job.isExpired) return <Badge className="bg-amber-100 text-amber-800">Đã hết hạn</Badge>;
  if (job.isPending) return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
  if (job.isApproved) return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
  return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
}
