import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const txnRef = searchParams.get('txnRef');
  const flow = searchParams.get('flow');

  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isCandidateFlow = flow === 'CANDIDATE';
  const isBoostFlow = flow === 'BOOST';

  const successMessage = isCandidateFlow
    ? 'Gói dịch vụ dành cho người tìm việc đã được kích hoạt cho tài khoản của bạn.'
    : isBoostFlow
      ? 'Gói boost đã được kích hoạt cho tin tuyển dụng của bạn.'
      : 'Gói dịch vụ nhà tuyển dụng đã được kích hoạt cho tài khoản của bạn.';

  const failedBackLink = isCandidateFlow ? '/user/pricing' : '/employer/pricing';
  const successPrimaryLink = isCandidateFlow ? '/user/pricing' : '/employer/jobs';
  const successPrimaryText = isCandidateFlow ? 'Quản lý gói người tìm việc' : 'Quản lý tin tuyển dụng';
  const successSecondaryLink = isCandidateFlow ? '/user/dashboard' : '/employer/dashboard';
  const successSecondaryText = 'Về Dashboard';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-2">
                {successMessage}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Mã giao dịch: {txnRef}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to={successPrimaryLink}>{successPrimaryText}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={successSecondaryLink}>{successSecondaryText}</Link>
                </Button>
              </div>
            </>
          ) : isFailed ? (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 mb-2">
                Giao dịch không thành công. Vui lòng thử lại.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Mã giao dịch: {txnRef}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to={failedBackLink}>Quay lại</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Giao dịch không hợp lệ
              </h2>
              <p className="text-gray-600 mb-6">
                Chữ ký bảo mật không khớp. Vui lòng liên hệ hỗ trợ.
              </p>
              <Button asChild className="w-full">
                <Link to="/">Về trang chủ</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
