import { useState, useEffect } from 'react';
import {
  getPlans,
  createPaymentUrl,
  getSubscriptionStatus,
  type SubscriptionPlan,
  type CompanySubscriptionStatus,
} from '@/services/subscription-plan.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, Zap, Crown, Star, FileText, ScanLine, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';

const planIcons: Record<string, React.ReactNode> = {
  PLUS: <Star className="h-8 w-8 text-blue-500" />,
  PREMIUM: <Zap className="h-8 w-8 text-orange-500" />,
  VIP: <Crown className="h-8 w-8 text-yellow-500" />,
};

const planGradients: Record<string, string> = {
  PLUS: 'from-blue-500/10 to-transparent border-blue-200 hover:border-blue-400',
  PREMIUM: 'from-orange-500/10 to-transparent border-orange-200 hover:border-orange-400',
  VIP: 'from-yellow-400/20 via-orange-300/10 to-transparent border-yellow-300 hover:border-yellow-400 ring-2 ring-yellow-400/50 shadow-xl shadow-yellow-500/10',
};

const planBadges: Record<string, string> = {
  PLUS: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  PREMIUM: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  VIP: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function mapAccountStatusLabel(status?: string) {
  switch (status) {
    case 'PENDING_PAYMENT': return 'Đang chờ thanh toán';
    case 'PAID_ACTIVE': return 'Gói trả phí đang hoạt động';
    case 'TRIAL_ACTIVE': return 'Dùng thử đang hoạt động';
    case 'EXPIRED': return 'Gói đã hết hạn';
    case 'TRIAL_EXPIRED': return 'Dùng thử đã hết hạn';
    default: return 'Không xác định';
  }
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<CompanySubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getPlans('SUBSCRIPTION'), getSubscriptionStatus()])
      .then(([plansData, statusData]) => {
        setPlans(plansData || []);
        setSubscriptionStatus(statusData || null);
      })
      .catch(() => toast.error('Không thể tải danh sách gói'))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planId: number) => {
    const hasPendingOrder = subscriptionStatus?.hasPendingOrder === true;
    const samePlanActive = subscriptionStatus?.active && subscriptionStatus.currentPlanId === planId;

    if (hasPendingOrder) return toast.error('Bạn đang có giao dịch chờ thanh toán');
    if (samePlanActive) return toast.error('Gói này đang còn hiệu lực, không thể mua trùng');

    try {
      setPurchasing(planId);
      const paymentUrl = await createPaymentUrl(planId);
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error?.message || 'Tạo thanh toán thất bại');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Nâng tầm tuyển dụng với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Gói Dịch Vụ</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Mở rộng quota đăng tin, ứng dụng AI quét CV thông minh và truy cập các tính năng ưu việt giúp bạn tìm kiếm nhân tài nhanh chóng.
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <div className="mb-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Crown className="w-5 h-5 text-indigo-500" />
                Thông tin gói hiện tại
              </h3>
              {subscriptionStatus.active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Account Plan Details */}
              <div className="p-6 col-span-1 lg:col-span-2">
                <p className="text-sm font-medium text-slate-500 mb-1">Gói dịch vụ</p>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {subscriptionStatus.currentPlanName || 'Gói Cơ Bản (Free)'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Hết hạn: <span className="font-semibold text-slate-800">{formatDateTime(subscriptionStatus.expiresAt)}</span>
                </div>
                <div className="inline-flex items-center text-sm font-medium text-slate-600">
                  Trạng thái: <span className="ml-1 text-slate-900">{mapAccountStatusLabel(subscriptionStatus.accountStatus)}</span>
                </div>
              </div>

              {/* Quotas */}
              <div className="p-6 col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex flex-col gap-2 transition-colors hover:bg-blue-50 cursor-default">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold text-sm">Lượt đăng tin</span>
                  </div>
                  <div className="text-3xl font-black text-blue-900">{subscriptionStatus.remainingJobPosts}</div>
                </div>

                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100/50 flex flex-col gap-2 transition-colors hover:bg-orange-50 cursor-default">
                  <div className="flex items-center gap-2 text-orange-700">
                    <ScanLine className="w-5 h-5" />
                    <span className="font-semibold text-sm">Lượt quét AI</span>
                  </div>
                  <div className="text-3xl font-black text-orange-900">{subscriptionStatus.remainingAiScans}</div>
                </div>
              </div>
            </div>

            {/* Pending Order Warning */}
            {subscriptionStatus.hasPendingOrder && (
              <div className="bg-amber-50 px-6 py-4 flex items-start gap-3 border-t border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Bạn đang có giao dịch chờ thanh toán.</span> Vui lòng hoàn tất thanh toán hoặc chờ hệ thống cập nhật trước khi mua gói mới.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {(plans || []).map((plan) => (
            <Card
              key={plan.planId}
              className={`relative flex flex-col overflow-hidden transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-b ${planGradients[plan.type] || 'border-slate-200 hover:shadow-lg'}`}
            >
              {plan.type === 'VIP' && (
                <div className="absolute top-0 right-0 -mr-8 mt-6 w-36 origin-top-right rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 py-1 text-center text-xs font-bold text-white shadow-md">
                  BEST SELLER
                </div>
              )}
              
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="mb-6 flex flex-col items-center">
                  <div className={`p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 mb-5 ${plan.type === 'VIP' ? 'shadow-yellow-100' : ''}`}>
                    {planIcons[plan.type] || <Star className="h-8 w-8 text-slate-400" />}
                  </div>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide uppercase ${planBadges[plan.type] || 'bg-slate-100 text-slate-700'}`}>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {formatPrice(plan.price)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    chu kỳ {plan.durationDays} ngày
                  </p>
                </div>

                <div className="w-full h-px bg-slate-100 my-6" />

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.jobPostLimit > 0 && (
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">Thêm <strong className="text-slate-900">{plan.jobPostLimit}</strong> lượt đăng việc làm</span>
                    </li>
                  )}
                  {plan.aiCvScanningLimit > 0 && (
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium"><strong className="text-slate-900">{plan.aiCvScanningLimit}</strong> lượt chấm điểm CV bằng AI</span>
                    </li>
                  )}
                  {plan.useAiCvBuilder && (
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">Toàn quyền sử dụng <strong className="text-slate-900">AI CV Builder</strong></span>
                    </li>
                  )}
                  {plan.description && (
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-sm text-slate-600 leading-relaxed">{plan.description}</span>
                    </li>
                  )}
                </ul>

                <Button
                  className={`w-full h-12 text-sm font-bold shadow-md transition-all ${
                    plan.type === 'VIP' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-yellow-500/25 hover:shadow-yellow-500/40' 
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                  }`}
                  onClick={() => handlePurchase(plan.planId)}
                  disabled={
                    purchasing !== null ||
                    subscriptionStatus?.hasPendingOrder === true ||
                    (subscriptionStatus?.active === true && subscriptionStatus.currentPlanId === plan.planId)
                  }
                >
                  {purchasing === plan.planId
                    ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý</div>
                    : subscriptionStatus?.hasPendingOrder
                      ? 'Giao dịch đang kẹt'
                      : subscriptionStatus?.active && subscriptionStatus.currentPlanId === plan.planId
                        ? 'Gói đang hiện hành'
                        : 'Mở khóa ngay'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
