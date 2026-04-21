import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Flame, Crown, Zap, Sparkles, TrendingUp } from 'lucide-react';
import {
  getPlans,
  createPaymentUrl,
  type SubscriptionPlan,
} from '@/services/subscription-plan.service';

interface BoostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | null;
  jobTitle?: string;
}

const planIcons: Record<string, React.ReactNode> = {
  PLUS: <Flame className="h-7 w-7 text-orange-500" />,
  PREMIUM: <Zap className="h-7 w-7 text-rose-500" />,
  VIP: <Crown className="h-7 w-7 text-yellow-500" />,
};

const planGradients: Record<string, string> = {
  PLUS: 'from-orange-500/10 to-transparent border-orange-200 hover:border-orange-400',
  PREMIUM: 'from-rose-500/10 to-transparent border-rose-200 hover:border-rose-400',
  VIP: 'from-yellow-400/20 via-orange-300/10 to-transparent border-yellow-300 hover:border-yellow-400 ring-2 ring-yellow-400/50 shadow-xl shadow-yellow-500/10',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function BoostJobModal({ isOpen, onClose, jobId, jobTitle }: BoostJobModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getPlans('BOOST')
        .then((data) => setPlans(data || []))
        .catch(() => toast.error('Lỗi khi tải danh sách gói Boost'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handlePurchase = async (planId: number) => {
    if (!jobId) return;
    try {
      setPurchasing(planId);
      const paymentUrl = await createPaymentUrl(planId, jobId);
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error?.message || 'Tạo giao dịch thất bại');
      setPurchasing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} showClose className="p-0 max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-50 border-0 shadow-2xl rounded-2xl">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-cyan-600 via-sky-500 to-blue-600 px-8 py-8 md:py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <TrendingUp className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner ring-1 ring-white/20">
                <Flame className="h-7 w-7 text-orange-400" />
              </div>
              <h2 className="text-3xl tracking-tight font-extrabold text-white">
                Đẩy Top Tin Tuyển Dụng
              </h2>
            </div>
            
            <p className="text-slate-300 mt-2 max-w-xl text-lg">
              {jobTitle ? (
                <span>
                  Đang thiết lập ưu tiên cho tin: <br />
                  <strong className="text-white font-bold bg-white/10 px-3 py-1 mt-2 inline-block rounded-md border border-white/10 shadow-sm">{jobTitle}</strong>
                </span>
              ) : (
                'Gấp gáp tìm nhân tài? Tăng ngay độ phủ sóng và khả năng tiếp cận hàng nghìn ứng viên tiềm năng.'
              )}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-8 md:px-8 bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center py-20 flex-col gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-r-2 border-orange-500" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải các gói Boost...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Hệ thống chưa thiết lập gói Boost nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20">
              {plans.map((plan) => (
                <div
                  key={plan.planId}
                  className={`bg-white relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-b ${planGradients[plan.type] || 'border-slate-200 hover:shadow-lg'}`}
                >
                  {plan.priorityLevel === 3 && (
                    <div className="absolute top-0 right-0 -mr-8 mt-5 w-32 origin-top-right rotate-45 bg-gradient-to-r from-orange-500 to-rose-500 py-1 text-center text-[10px] font-bold text-white shadow-md tracking-wider uppercase">
                      HIỆU QUẢ NHẤT
                    </div>
                  )}
                  
                  <div className="px-6 py-6 pb-4 text-center border-b border-slate-100 flex-none">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 ${plan.priorityLevel === 3 ? 'shadow-orange-100' : ''}`}>
                        {planIcons[plan.type] || <Flame className="h-7 w-7 text-slate-400" />}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xl tracking-tight mb-2">{plan.name}</h3>
                    <div className="flex justify-center items-baseline gap-1 text-slate-900 mb-1">
                      <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700">
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-slate-100/80 inline-block px-3 py-1 rounded-full">
                      chu kỳ {plan.durationDays} ngày
                    </div>
                  </div>

                  <div className="px-6 py-6 flex-1 flex flex-col bg-white">
                    <ul className="text-sm text-slate-600 space-y-3 mb-8 flex-1">
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="font-medium text-slate-700">Tăng <strong className="text-orange-600 font-bold bg-orange-50 px-1 py-0.5 rounded">+{plan.boostScore}</strong> điểm hiển thị</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="font-medium text-slate-700">Đính kèm huy hiệu <strong className="text-rose-600 bg-rose-50 border border-rose-100 px-1.5 rounded uppercase text-[11px] font-black tracking-wider ml-1">HOT</strong></span>
                      </li>
                      {plan.description && (
                        <li className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                          </div>
                          <span className="font-medium text-slate-600 leading-relaxed">{plan.description}</span>
                        </li>
                      )}
                    </ul>

                    <Button
                      className={`w-full h-12 text-sm font-bold tracking-wide transition-all shadow-md ${
                        plan.priorityLevel === 3
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white shadow-orange-500/25 hover:shadow-orange-500/40' 
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                      }`}
                      disabled={purchasing !== null}
                      onClick={() => handlePurchase(plan.planId)}
                    >
                      {purchasing === plan.planId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang khởi tạo...
                        </div>
                      ) : (
                        'Chọn Gói Boost Này'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
