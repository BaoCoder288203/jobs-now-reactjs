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
import { Check, Zap, Crown, Star, FileText, ScanLine, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';

const planIcons: Record<string, React.ReactNode> = {
  PLUS: <Star className="h-8 w-8 text-[#3d9fd2]" />,
  PREMIUM: <Zap className="h-8 w-8 text-[#2f88b5]" />,
  VIP: <Crown className="h-8 w-8 text-[#1f6f98]" />,
};

const planGradients: Record<string, string> = {
  PLUS: 'from-[#ecf8fe] to-transparent border-[#c6e7f7] hover:border-[#8fcfee]',
  PREMIUM: 'from-[#e3f3fb] to-transparent border-[#b8dff3] hover:border-[#79c4e8]',
  VIP: 'from-[#d7edf9]/80 via-[#e7f5fd]/60 to-transparent border-[#8fccee] hover:border-[#5bb8e8] ring-2 ring-[#5bb8e8]/35 shadow-xl shadow-[#5bb8e8]/10',
};

const planBadges: Record<string, string> = {
  PLUS: 'bg-[#e9f6fd] text-[#2f7397] ring-1 ring-[#c2e4f6]',
  PREMIUM: 'bg-[#e2f2fb] text-[#226b8f] ring-1 ring-[#b6dbef]',
  VIP: 'bg-gradient-to-r from-[#5bb8e8] to-[#3aa8dc] text-white shadow-md',
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
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    Promise.all([getPlans('SUBSCRIPTION'), getSubscriptionStatus()])
      .then(([plansData, statusData]) => {
        setPlans(plansData || []);
        setSubscriptionStatus(statusData || null);
      })
      .catch(() => toast.error('Không thể tải danh sách gói'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setReveal(true), 120);
    return () => window.clearTimeout(timer);
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
      <div className="-m-6 bg-gradient-to-b from-[#f5fbff] via-[#eef8fd] to-[#f8fcff]">
        <div className="relative max-w-6xl mx-auto py-10 px-4 sm:px-6 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#9ad8f5]/25 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -right-20 h-80 w-80 rounded-full bg-[#5bb8e8]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#d3eefb]/30 blur-3xl" />
        
          {/* Header Section */}
          <div className={`relative text-center mb-12 space-y-4 transition-all duration-700 ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#14384c]">
              Nâng tầm tuyển dụng với <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f88b5] to-[#5bb8e8]">Gói Dịch Vụ</span>
            </h1>
            <p className="text-lg text-[#567082] max-w-2xl mx-auto">
              Mở rộng quota đăng tin, ứng dụng AI quét CV thông minh và truy cập các tính năng ưu việt giúp bạn tìm kiếm nhân tài nhanh chóng.
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscriptionStatus && (
            <div className={`mb-14 overflow-hidden rounded-2xl border border-[#cae8f8] bg-white shadow-sm ring-1 ring-[#5bb8e8]/10 transition-all duration-700 delay-100 ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-[#f4fbff] border-b border-[#e1f1f9] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#214e67] flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#5bb8e8]" />
                Thông tin gói hiện tại
              </h3>
              {subscriptionStatus.active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e7f3fa]">
              
              {/* Account Plan Details */}
              <div className="p-6 col-span-1 lg:col-span-2">
                <p className="text-sm font-medium text-[#6a8493] mb-1">Gói dịch vụ</p>
                <div className="text-2xl font-bold text-[#163f56] mb-2">
                  {subscriptionStatus.currentPlanName || 'Gói Cơ Bản (Free)'}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#567082] mb-2">
                  <Clock className="w-4 h-4 text-[#88aec2]" />
                  Hết hạn: <span className="font-semibold text-[#214e67]">{formatDateTime(subscriptionStatus.expiresAt)}</span>
                </div>
                <div className="inline-flex items-center text-sm font-medium text-[#567082]">
                  Trạng thái: <span className="ml-1 text-[#214e67]">{mapAccountStatusLabel(subscriptionStatus.accountStatus)}</span>
                </div>
              </div>

              {/* Quotas */}
              <div className="p-6 col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#edf8fe] border border-[#cae8f8] flex flex-col gap-2 transition-colors hover:bg-[#e4f4fd] cursor-default">
                  <div className="flex items-center gap-2 text-[#2b7397]">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold text-sm">Lượt đăng tin</span>
                  </div>
                  <div className="text-3xl font-black text-[#164763]">{subscriptionStatus.remainingJobPosts}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#e4f3fb] border border-[#badeef] flex flex-col gap-2 transition-colors hover:bg-[#d9edf8] cursor-default">
                  <div className="flex items-center gap-2 text-[#226b8f]">
                    <ScanLine className="w-5 h-5" />
                    <span className="font-semibold text-sm">Lượt quét AI</span>
                  </div>
                  <div className="text-3xl font-black text-[#164763]">{subscriptionStatus.remainingAiScans}</div>
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
            {(plans || []).map((plan, index) => (
              <Card
                key={plan.planId}
                style={{ transitionDelay: `${180 + index * 100}ms` }}
                className={`group relative flex flex-col overflow-hidden transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.01] hover:shadow-2xl ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} bg-gradient-to-b ${planGradients[plan.type] || 'border-[#d7ecf8] hover:shadow-lg'}`}
              >
              {plan.type === 'VIP' && (
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,184,232,0.28),transparent_60%)]" />
              )}
              {plan.type === 'VIP' && (
                <div className="absolute top-0 right-0 -mr-8 mt-6 w-36 origin-top-right rotate-45 bg-gradient-to-r from-[#2f88b5] to-[#5bb8e8] py-1 text-center text-xs font-bold text-white shadow-md">
                  BEST SELLER
                </div>
              )}
              
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="mb-6 flex flex-col items-center">
                  <div className={`p-4 rounded-2xl bg-white shadow-sm ring-1 ring-[#204e68]/10 mb-5 ${plan.type === 'VIP' ? 'shadow-sky-100' : ''}`}>
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
                  <p className="text-sm font-medium text-[#6a8493] mt-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    chu kỳ {plan.durationDays} ngày
                  </p>
                </div>

                <div className="w-full h-px bg-[#e2f1f9] my-6" />

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
                  className={`w-full h-12 text-sm font-bold shadow-md transition-all duration-300 ${
                    plan.type === 'VIP' 
                      ? 'bg-gradient-to-r from-[#2f88b5] to-[#5bb8e8] hover:from-[#27779f] hover:to-[#4ca9d8] text-white shadow-[#5bb8e8]/30 hover:shadow-[#5bb8e8]/45' 
                      : 'bg-[#5bb8e8] hover:bg-[#4ca9d8] text-white shadow-[#5bb8e8]/30 hover:shadow-[#5bb8e8]/40'
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
                        : <span className="inline-flex items-center gap-2">Mở khóa ngay <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" /></span>}
                </Button>
              </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
