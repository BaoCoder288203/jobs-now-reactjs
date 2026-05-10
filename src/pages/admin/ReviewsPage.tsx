import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  useApproveAdminReview,
  useAdminPendingReviews,
  useRejectAdminReview,
} from '@/modules/companies/hooks';

export function AdminReviewsPage() {
  const { data, isLoading } = useAdminPendingReviews(1, 20);
  const approveMutation = useApproveAdminReview();
  const rejectMutation = useRejectAdminReview();
  const reviews = data?.items ?? [];

  const handleApprove = async (reviewId: number) => {
    try {
      await approveMutation.mutateAsync(reviewId);
      toast.success('Đã duyệt đánh giá');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể duyệt đánh giá');
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      await rejectMutation.mutateAsync(reviewId);
      toast.success('Đã từ chối đánh giá');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể từ chối đánh giá');
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Duyệt đánh giá công ty</h1>
          <p className="text-sm text-gray-600">{data?.totalCount ?? 0} đánh giá chờ duyệt</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Hiện không có đánh giá chờ duyệt.</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
                        <div className="mt-1 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-900">{review.title}</h3>

                    {(review.pros || review.cons) && (
                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div className="rounded-lg bg-emerald-50 p-3">
                          <p className="font-medium text-emerald-700">Pros</p>
                          <p className="mt-1 text-emerald-900">{review.pros || '-'}</p>
                        </div>
                        <div className="rounded-lg bg-rose-50 p-3">
                          <p className="font-medium text-rose-700">Cons</p>
                          <p className="mt-1 text-rose-900">{review.cons || '-'}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(review.reviewId)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        Từ chối
                      </Button>
                      <Button
                        onClick={() => handleApprove(review.reviewId)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        Duyệt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
