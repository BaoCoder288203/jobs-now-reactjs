import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { linkedinLoginAsync } from '@/auth/authSlice';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LINKEDIN_STATE_KEY = 'linkedin_oauth_state';
const LINKEDIN_ROLE_KEY = 'linkedin_oauth_role';
const LINKEDIN_REDIRECT_KEY = 'linkedin_oauth_redirect_uri';

function resolveLinkedInErrorMessage(err: unknown): string {
  const rawMessage =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : '';

  if (!rawMessage) {
    return 'Đăng nhập LinkedIn thất bại. Vui lòng thử lại.';
  }

  if (rawMessage.includes('oauth.token.encryption.key')) {
    return 'Hệ thống chưa cấu hình bảo mật LinkedIn token. Vui lòng liên hệ quản trị viên.';
  }

  if (rawMessage.includes('Network Error') || rawMessage.includes('ERR_NETWORK')) {
    return 'Không thể kết nối máy chủ xác thực. Vui lòng thử lại sau.';
  }

  return rawMessage;
}

export function LinkedInCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  const redirectUri = useMemo(
    () => localStorage.getItem(LINKEDIN_REDIRECT_KEY) || import.meta.env.VITE_LINKEDIN_REDIRECT_URI,
    []
  );

  useEffect(() => {
    if (hasSubmittedRef.current) {
      return;
    }

    const expectedState = localStorage.getItem(LINKEDIN_STATE_KEY);
    const roleName = localStorage.getItem(LINKEDIN_ROLE_KEY) || 'ROLE_JOBSEEKER';

    const clearOAuthStorage = () => {
      localStorage.removeItem(LINKEDIN_STATE_KEY);
      localStorage.removeItem(LINKEDIN_ROLE_KEY);
      localStorage.removeItem(LINKEDIN_REDIRECT_KEY);
    };

    if (oauthError) {
      setError('Bạn đã từ chối quyền đăng nhập LinkedIn hoặc phiên xác thực không hợp lệ.');
      clearOAuthStorage();
      return;
    }

    if (!code || !state) {
      setError('Thiếu mã xác thực LinkedIn. Vui lòng thử lại.');
      clearOAuthStorage();
      return;
    }

    if (!expectedState || expectedState !== state) {
      setError('Phiên đăng nhập LinkedIn không hợp lệ. Vui lòng thử lại.');
      clearOAuthStorage();
      return;
    }

    if (
      window.location.hostname !== 'localhost' &&
      (apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1'))
    ) {
      setError('Cấu hình API chưa đúng cho môi trường production. Vui lòng liên hệ quản trị viên.');
      clearOAuthStorage();
      return;
    }

    hasSubmittedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      setError('Hết thời gian xác thực LinkedIn. Vui lòng thử lại.');
    }, 15000);

    void (async () => {
      try {
        const result = await dispatch(linkedinLoginAsync({ code, roleName, redirectUri })).unwrap();
        window.clearTimeout(timeoutId);
        clearOAuthStorage();

        if (result.role === 'ROLE_COMPANY') {
          navigate('/employer/dashboard', { replace: true });
          return;
        }
        if (result.role === 'ROLE_ADMIN') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        navigate('/user/dashboard', { replace: true });
      } catch (err: unknown) {
        window.clearTimeout(timeoutId);
        setError(resolveLinkedInErrorMessage(err));
      }
    })();
  }, [apiBaseUrl, code, dispatch, navigate, oauthError, redirectUri, state]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-red-600">Không thể đăng nhập LinkedIn</h1>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
              onClick={() => navigate('/', { replace: true })}
            >
              Quay về trang chủ
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-gray-900">Đang xác thực LinkedIn</h1>
            <p className="mt-2 text-sm text-gray-600">Vui lòng chờ trong giây lát...</p>
          </>
        )}
      </div>
    </div>
  );
}
