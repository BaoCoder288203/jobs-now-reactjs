import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  useCompanyDetail,
  useCompanyReviews,
  useCreateCompanyReview,
  useCompanyFollowStatus,
  useFollowCompany,
  useUnfollowCompany,
} from '@/modules/companies/hooks';
import { useJobs } from '@/modules/jobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from '@/components/common/JobCard';
import { OverallRatingCharts } from '@/components/company/OverallRatingCharts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Briefcase, MapPin, Building2, MessageCircle, Star, Heart } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import * as chatService from '@/services/chat.service';
import type { CompanyReview, CreateCompanyReviewRequest } from '@/types/company-review';

const REVIEWS_PER_PAGE = 5;

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompanyDetail(id!);
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ company_id: id, limit: 100 });
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [reviewPage, setReviewPage] = useState(1);
  const [allReviews, setAllReviews] = useState<CompanyReview[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [reviewForm, setReviewForm] = useState<CreateCompanyReviewRequest>({
    rating: 5,
    title: '',
    pros: '',
    cons: '',
    recommend: true,
  });
  const navigate = useNavigate();
  const createReviewMutation = useCreateCompanyReview(id ?? '');
  const followMutation = useFollowCompany(id ?? '');
  const unfollowMutation = useUnfollowCompany(id ?? '');
  const { data: isFollowing = false } = useCompanyFollowStatus(id ?? '', !!isAuthenticated);
  const { data: reviewsData, isLoading: reviewsLoading, isFetching: reviewsFetching } = useCompanyReviews(
    id ?? '',
    reviewPage,
    REVIEWS_PER_PAGE
  );

  useEffect(() => {
    setReviewPage(1);
    setAllReviews([]);
  }, [id]);

  useEffect(() => {
    if (!reviewsData) return;
    if (reviewPage === 1) {
      setAllReviews(reviewsData.items);
      return;
    }
    setAllReviews((prev) => [...prev, ...reviewsData.items]);
  }, [reviewsData, reviewPage]);

  const canWriteReview = useMemo(
    () => isAuthenticated && user?.role === 'ROLE_JOBSEEKER',
    [isAuthenticated, user?.role]
  );

  const reviewStats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let recommendCount = 0;

    allReviews.forEach((review) => {
      const rating = Math.max(1, Math.min(5, review.rating));
      counts[rating] = (counts[rating] ?? 0) + 1;
      if (review.recommend) recommendCount += 1;
    });

    const denominator = allReviews.length || 1;
    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: counts[rating] ?? 0,
      percent: Math.round(((counts[rating] ?? 0) / denominator) * 100),
    }));

    return {
      distribution,
      recommendPercent: Math.round((recommendCount / denominator) * 100),
    };
  }, [allReviews]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const handleSendMessage = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'ROLE_JOBSEEKER') {
      toast.error('Chỉ người tìm việc mới có thể nhắn tin cho công ty.');
      return;
    }

    try {
      if (!company?.owner_user_id) {
        toast.error('Tài khoản công ty này không khả dụng để nhắn tin.');
        return;
      }
      
      await chatService.createConversation(user.userId, Number(company.owner_user_id));
      navigate('/chat');
    } catch (error) {
      console.error('Failed to start conversation', error);
      toast.error('Không thể tạo cuộc trò chuyện lúc này.');
    }
  };

  if (!company) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Không tìm thấy công ty</p>
        </div>
      </AppLayout>
    );
  }

  const companyJobs = jobsData?.items?.filter((job) => job.company_id === id) || [];
  const hasImages = company.thumbnail_images && company.thumbnail_images.length > 0;
  const averageRating = reviewsData?.averageRating ?? 0;
  const totalReviews = reviewsData?.totalCount ?? 0;

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    if (!reviewForm.title.trim() || !reviewForm.pros?.trim() || !reviewForm.cons?.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề, điểm tốt và đề xuất cải thiện');
      return;
    }

    try {
      const trimmedPros = reviewForm.pros?.trim() ?? '';
      const trimmedCons = reviewForm.cons?.trim() ?? '';

      await createReviewMutation.mutateAsync({
        ...reviewForm,
        title: reviewForm.title.trim(),
        pros: trimmedPros,
        cons: trimmedCons,
      });

      toast.success('Review submitted, waiting for approval');
      setIsReviewModalOpen(false);
      setReviewForm({
        rating: 5,
        title: '',
        pros: '',
        cons: '',
        recommend: true,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi đánh giá lúc này');
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync();
        toast.success('Đã bỏ theo dõi công ty');
      } else {
        await followMutation.mutateAsync();
        toast.success('Đã theo dõi công ty');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cập nhật trạng thái theo dõi');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* 1. Header */}
        <header className="relative">
          {company.banner_url ? (
            <div
              className="h-48 md:h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${company.banner_url})` }}
            />
          ) : (
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-24 pointer-events-none" />
          <div className="container mx-auto px-4 max-w-5xl relative -mt-20 pb-6">
            <Link to="/companies" className="inline-block mb-4">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row items-start gap-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {company.name}
                </h1>
                {company.slogan && (
                  <p className="text-primary font-medium mb-3">{company.slogan}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {company.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {company.address}
                    </span>
                  )}
                  {(company.industries?.length ? company.industries.map((i) => i.name).join(', ') : company.industry?.name) && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {company.industries?.map((i) => i.name).join(', ') || company.industry?.name}
                    </span>
                  )}
                  {company.company_size && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      {company.company_size} nhân viên
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      Trang web
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="gap-2 h-12 px-6 text-base font-semibold sm:w-auto w-full bg-white text-primary border border-primary hover:bg-primary/5"
                    disabled={!canWriteReview}
                  >
                    <Star className="h-5 w-5" />
                    Write Review
                  </Button>
                  <Button
                    onClick={handleToggleFollow}
                    className="gap-2 h-12 px-6 text-base font-semibold sm:w-auto w-full bg-primary text-white border border-primary hover:bg-primary-dark"
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    <Heart className={`h-5 w-5 ${isFollowing ? 'fill-white' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={handleSendMessage}
                    className="gap-2 h-12 px-6 text-base font-semibold sm:w-auto w-full bg-white text-primary border border-primary hover:bg-primary/5"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Nhắn tin cho công ty
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{totalReviews} Reviews</span>
                  <span className="text-sm text-gray-500">- {company.follower_count ?? 0} followers</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 max-w-5xl pt-6">
          <div className="rounded-xl border border-gray-200 bg-white px-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-1 py-4 border-b-2 text-base font-semibold whitespace-nowrap transition ${
                  activeTab === 'overview'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-1 py-4 border-b-2 text-base font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs bg-primary text-white">
                  {totalReviews}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-10">
          {activeTab === 'overview' && (
            <>
              {/* 2. Company Overview */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu công ty</h2>
                  <div className="prose prose-gray max-w-none text-gray-600">
                    {company.description ? (
                      <p className="whitespace-pre-line">
                        {company.description.replace(/<[^>]*>/g, '')}
                      </p>
                    ) : (
                      <p className="text-gray-500">Chưa có mô tả.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3. Our People */}
              {hasImages && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Hình ảnh công ty</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {company.thumbnail_images!.map((url, index) => (
                        <div
                          key={index}
                          className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={url}
                            alt={`${company.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 4. Job Openings */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Việc làm đang tuyển
                    {companyJobs.length > 0 && (
                      <span className="text-primary font-normal ml-2">
                        ({companyJobs.length} vị trí)
                      </span>
                    )}
                  </h2>
                  {jobsLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : companyJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={{ ...job, company: job.company ?? company }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Hiện không có vị trí tuyển dụng.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'reviews' && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <OverallRatingCharts
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                  recommendPercent={reviewStats.recommendPercent}
                  distribution={reviewStats.distribution}
                />
                <div className="border-t border-gray-200 my-6" />
                <p className="text-lg font-semibold text-gray-900 mb-4">{totalReviews} reviews</p>

                {reviewsLoading && reviewPage === 1 ? (
                  <div className="flex justify-center py-10">
                    <LoadingSpinner />
                  </div>
                ) : allReviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {allReviews.map((review) => (
                        <div key={review.reviewId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`h-4 w-4 ${
                                      index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
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
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="rounded-lg bg-emerald-50 p-3">
                                <p className="font-medium text-emerald-700">What makes you love working here</p>
                                <p className="mt-1 text-emerald-900">{review.pros || '-'}</p>
                              </div>
                              <div className="rounded-lg bg-rose-50 p-3">
                                <p className="font-medium text-rose-700">Suggestion for improvement</p>
                                <p className="mt-1 text-rose-900">{review.cons || '-'}</p>
                              </div>
                            </div>
                          )}
                          <div className="mt-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                review.recommend
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              Recommend: {review.recommend ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {reviewsData?.hasNext && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setReviewPage((prev) => prev + 1)}
                          disabled={reviewsFetching}
                        >
                          {reviewsFetching ? 'Đang tải...' : 'Load more'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào được duyệt.</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl p-6" onClose={() => setIsReviewModalOpen(false)}>
          <h3 className="text-xl font-semibold text-gray-900">Write Review</h3>
          <p className="text-sm text-gray-600 mt-1">Chia sẻ trải nghiệm của bạn về công ty.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmitReview}>
            <div>
              <Label>
                Rating <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="review-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="review-title"
                placeholder="Tiêu đề đánh giá"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-pros">
                  What makes you love working here <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="review-pros"
                  rows={3}
                  placeholder="Chia sẻ điều bạn thích nhất khi làm việc tại công ty"
                  value={reviewForm.pros}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, pros: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="review-cons">
                  Suggestion for improvement <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="review-cons"
                  rows={3}
                  placeholder="Đề xuất để công ty cải thiện tốt hơn"
                  value={reviewForm.cons}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, cons: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>
                Recommend <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="recommend"
                    className="h-4 w-4 accent-primary"
                    checked={reviewForm.recommend === true}
                    onChange={() => setReviewForm((prev) => ({ ...prev, recommend: true }))}
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="recommend"
                    className="h-4 w-4 accent-primary"
                    checked={reviewForm.recommend === false}
                    onChange={() => setReviewForm((prev) => ({ ...prev, recommend: false }))}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReviewMutation.isPending}>
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit review'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
