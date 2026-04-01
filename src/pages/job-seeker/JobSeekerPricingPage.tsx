import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlans, createPaymentUrl, getCandidateSubscriptionStatus } from '../../services/subscription-plan.service';
import type { SubscriptionPlan, CandidateSubscriptionStatus } from '../../services/subscription-plan.service';
import { Crown, Star, Sparkles, Zap, CheckCircle } from 'lucide-react';

const JobSeekerPricingPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<CandidateSubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allPlans, currentStatus] = await Promise.all([
        getPlans('CANDIDATE_SUBSCRIPTION'),
        getCandidateSubscriptionStatus()
      ]);
      setPlans(allPlans);
      setStatus(currentStatus);
    } catch (error) {
      console.error('Lỗi tải dữ liệu gói:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: number) => {
    try {
      setPurchasing(planId);
      const paymentUrl = await createPaymentUrl(planId);
      window.location.href = paymentUrl;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch!');
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-r-2 border-cyan-500"></div>
      </div>
    );
  }

  // Expecting only 1 PRO plan as per user request
  const proPlan = plans[0];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400 rounded-full blur-3xl opacity-10"></div>
        <h1 className="text-4xl font-black mb-4 tracking-tight text-slate-900 relative z-10">
          Nâng cấp <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-sky-500">Tài Khoản PRO</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto relative z-10">
          Gây ấn tượng mạnh mẽ với nhà tuyển dụng, tăng tỷ lệ phản hồi và mở khoá hàng loạt tính năng ưu việt chỉ với một click.
        </p>
      </div>

      {/* Subscription Status Board */}
      {status && status.accountStatus !== 'NO_PLAN' && (
        <Card className="mb-16 border-0 shadow-xl bg-white rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Crown className="w-32 h-32 text-cyan-500" />
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-100 rounded-2xl ring-1 ring-cyan-500/20">
                  <Star className="w-8 h-8 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tính năng PRO của bạn</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Đang hoạt động
                    </span>
                    <span className="text-slate-500 text-sm">Gói: {status.currentPlanName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Hiệu lực đến</p>
                <p className="text-lg font-bold text-slate-900">
                  {status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <hr className="my-8 border-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <span className="font-medium text-slate-700">Lượt AI Matching còn lại</span>
                </div>
                <div className="text-xl font-bold text-slate-900">{status.remainingAiMatches}</div>
              </div>

              <div className="p-5 flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Lượt tạo/chuẩn hóa CV AI còn lại</span>
                </div>
                <div className="text-xl font-bold text-emerald-900">{status.remainingAiCvBuilderTrials}</div>
              </div>
              
              <div className="p-5 flex items-center justify-between rounded-2xl bg-cyan-50 border border-cyan-100">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-cyan-600" />
                  <span className="font-medium text-cyan-800">Hồ sơ nổi bật</span>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-md ${status.isProfileHighlighted ? 'bg-cyan-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                  {status.isProfileHighlighted ? 'ĐÃ KÍCH HOẠT' : 'CHƯA BẬT'}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Hồ sơ nổi bật đã được kích hoạt ở mức dữ liệu gói; giao diện hiển thị ưu tiên cho nhà tuyển dụng đang được hoàn thiện.
            </p>
          </div>
        </Card>
      )}

      {/* Pricing Plan - Just 1 Card Centered */}
      {!proPlan ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <p className="text-slate-500">Hệ thống chưa thiết lập gói dịch vụ PRO.</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <Card className="relative overflow-hidden bg-white border-0 shadow-2xl rounded-[2rem] transform transition-transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
            
            <div className="p-8 md:p-12 text-center border-b border-slate-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="inline-block p-4 bg-cyan-50 rounded-2xl text-cyan-600 mb-6 ring-1 ring-cyan-200/50">
                <Crown className="w-8 h-8" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-2">{proPlan.name}</h2>
              <p className="text-slate-500 mb-6">{proPlan.description || "Nâng cấp kỹ năng, kết nối cơ hội"}</p>
              
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700">
                  {proPlan.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-slate-500 font-medium tracking-wide">/ {proPlan.durationDays} ngày</span>
              </div>
            </div>

            <div className="p-8 md:p-12 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-cyan-500 pl-3">Đặc Quyền Của Bạn</h4>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-500 shrink-0" />
                  <span className="text-slate-700"><b>{proPlan.aiMatchLimit || "Không giới hạn"}</b> lượt dùng AI Matching CV khớp JD</span>
                </li>
                {proPlan.isProfileHighlighted && (
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-cyan-500 shrink-0" />
                    <span className="text-slate-700"><b>Làm nổi bật hồ sơ</b> trong danh sách tìm kiếm của HR</span>
                  </li>
                )}
                {!!proPlan.useAiCvBuilder && (
                   <li className="flex gap-3">
                     <CheckCircle className="w-6 h-6 text-cyan-500 shrink-0" />
                     <span className="text-slate-700"><b>{proPlan.aiCvScanningLimit || 0}</b> lượt tạo/chuẩn hóa CV bằng AI trong thời hạn gói</span>
                   </li>
                )}
              </ul>
              
              <div className="mt-8">
                <Button 
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 transition-all"
                  onClick={() => handlePurchase(proPlan.planId)}
                  disabled={purchasing === proPlan.planId || Boolean(status && status.accountStatus !== 'NO_PLAN' && status.accountStatus !== 'EXPIRED')}
                >
                  {purchasing === proPlan.planId ? 'Đang tạo giao dịch...' : 'Nâng cấp lên PRO ngay'}
                </Button>
                {status && status.accountStatus !== 'NO_PLAN' && status.accountStatus !== 'EXPIRED' && (
                  <p className="text-center text-sm text-amber-600 font-medium mt-3">
                    Bạn đã sở hữu gói này.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobSeekerPricingPage;
