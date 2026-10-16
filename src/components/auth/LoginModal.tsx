import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAppDispatch } from '@/app/hooks';
import {
  loginAsync,
  loginByOtpAsync,
  googleLoginAsync,
  registerAsync,
  verifyOtpAsync,
} from '@/auth/authSlice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import * as authService from '@/services/auth.service';
import linkedinIcon from '@/assets/icons-socials/linkedin.svg';

type RoleMode = 'job_seeker' | 'employer';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RoleMode;
}

const checkAccountSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

const registerJobSeekerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải 10-11 số').optional().or(z.literal('')),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(20, 'Mật khẩu tối đa 20 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const registerCompanySchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải 10-11 số'),
  companyName: z.string().min(1, 'Tên công ty là bắt buộc'),
  website: z.string().optional(),
  description: z.string().optional(),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(20, 'Mật khẩu tối đa 20 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const otpSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP phải là 6 chữ số'),
});

type CheckAccountFormData = z.infer<typeof checkAccountSchema>;
type RegisterJobSeekerFormData = z.infer<typeof registerJobSeekerSchema>;
type RegisterCompanyFormData = z.infer<typeof registerCompanySchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;


export function LoginModal({ open, onOpenChange, mode }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'check' | 'register' | 'login' | 'login-otp' | 'verify-otp'>('check');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

  const modeText = mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng';

  const checkForm = useForm<CheckAccountFormData>({
    resolver: zodResolver(checkAccountSchema),
  });

  const registerJobSeekerForm = useForm<RegisterJobSeekerFormData>({
    resolver: zodResolver(registerJobSeekerSchema),
  });

  const registerCompanyForm = useForm<RegisterCompanyFormData>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      email: '',
      phone: '',
      companyName: '',
      website: '',
      description: '',
      password: '',
      confirmPassword: '',
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;
    const timer = setInterval(() => setResendCooldownSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldownSeconds]);

  const handleCheckAccount = async (data: CheckAccountFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const exists = await authService.checkEmail(data.email);
      setEmail(data.email);

      if (exists) {
        loginForm.setValue('email', data.email);
        setStep('login-otp');
        try {
          await authService.sendLoginOtp(data.email);
          setResendCooldownSeconds(60);
        } catch (sendErr: any) {
          setError(sendErr.message || 'Gửi mã OTP thất bại');
        }
      } else {
        if (mode === 'job_seeker') {
          registerJobSeekerForm.setValue('email', data.email);
        } else {
          registerCompanyForm.setValue('email', data.email);
        }
        setStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi kiểm tra email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await dispatch(loginAsync({
        email: data.email,
        password: data.password,
      })).unwrap();

      onOpenChange(false);

      if (result.role === 'ROLE_JOBSEEKER') {
        navigate('/user/dashboard', { replace: true });
      } else if (result.role === 'ROLE_COMPANY') {
        navigate('/employer/dashboard', { replace: true });
      } else if (result.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegisterJobSeeker = async (data: RegisterJobSeekerFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      await dispatch(registerAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || undefined,
        roleName: 'ROLE_JOBSEEKER',
      })).unwrap();

      setSuccessMessage('Đăng ký thành công! Hãy đăng nhập.');
      loginForm.setValue('email', data.email);
      setStep('login');
    } catch (err: any) {
      setError(err || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCompany = async (data: RegisterCompanyFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      await dispatch(registerAsync({
        email: data.email,
        password: data.password,
        phone: data.phone,
        roleName: 'ROLE_COMPANY',
        companyName: data.companyName,
        website: data.website,
        description: data.description,
        logo: logoFile || undefined,
      })).unwrap();

      setSuccessMessage('Vui lòng kiểm tra email để nhận mã OTP!');
      setStep('verify-otp');
    } catch (err: any) {
      setError(err || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      await dispatch(verifyOtpAsync({
        email,
        otp: data.otp,
      })).unwrap();

      setSuccessMessage('Xác thực thành công! Hãy đăng nhập.');
      loginForm.setValue('email', email);
      setStep('login');
    } catch (err: any) {
      setError(err || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.resendOtp(email);
      setSuccessMessage('Đã gửi lại mã OTP!');
    } catch (err: any) {
      setError(err.message || 'Gửi lại OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (data: OtpFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await dispatch(loginByOtpAsync({
        email,
        otp: data.otp,
      })).unwrap();

      onOpenChange(false);

      if (result.role === 'ROLE_JOBSEEKER') {
        navigate('/user/dashboard', { replace: true });
      } else if (result.role === 'ROLE_COMPANY') {
        navigate('/employer/dashboard', { replace: true });
      } else if (result.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;
    try {
      setError(null);
      setIsLoading(true);
      const roleName = mode === 'employer' ? 'ROLE_COMPANY' : 'ROLE_JOBSEEKER';
      const result = await dispatch(googleLoginAsync({ idToken, roleName })).unwrap();
      onOpenChange(false);
      if (result.role === 'ROLE_JOBSEEKER') {
        navigate('/user/dashboard', { replace: true });
      } else if (result.role === 'ROLE_COMPANY') {
        navigate('/employer/dashboard', { replace: true });
      } else if (result.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err || 'Đăng nhập Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    try {
      setError(null);
      const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const roleName = mode === 'employer' ? 'ROLE_COMPANY' : 'ROLE_JOBSEEKER';
      const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || `${window.location.origin}/callbacks`;

      localStorage.setItem('linkedin_oauth_state', state);
      localStorage.setItem('linkedin_oauth_role', roleName);
      localStorage.setItem('linkedin_oauth_redirect_uri', redirectUri);

      const authUrl = authService.getLinkedInAuthorizeUrl(state);
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Không thể khởi tạo đăng nhập LinkedIn');
    }
  };

  const handleResendLoginOtp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.sendLoginOtp(email);
      setResendCooldownSeconds(60);
      setSuccessMessage('Đã gửi lại mã OTP!');
    } catch (err: any) {
      setError(err.message || 'Gửi lại OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('check');
    setEmail('');
    setError(null);
    setSuccessMessage(null);
    setLogoFile(null);
    setResendCooldownSeconds(0);
    checkForm.reset();
    registerJobSeekerForm.reset();
    registerCompanyForm.reset();
    loginForm.reset();
    otpForm.reset();
    onOpenChange(false);
  };

  const handleDialogOverlayClick = (open: boolean) => {
    if (!open) handleClose();
  };

  const handleBack = () => {
    setStep('check');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOverlayClick}>
      <DialogContent className="p-0" onClose={handleClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          <div className="p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{modeText}</h2>
              <p className="text-gray-600">
                {step === 'check' && 'Đăng nhập hoặc Đăng ký'}
                {step === 'register' && 'Tạo tài khoản mới'}
                {step === 'login' && 'Đăng nhập'}
                {step === 'login-otp' && 'Nhập mã OTP đăng nhập'}
                {step === 'verify-otp' && 'Xác thực OTP'}
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {step === 'check' && (
              <form onSubmit={checkForm.handleSubmit(handleCheckAccount)} className="flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="check_email">Email</Label>
                      <Input
                        id="check_email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        {...checkForm.register('email')}
                        className={checkForm.formState.errors.email ? 'border-red-500' : ''}
                      />
                      {checkForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{checkForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang kiểm tra...</span>
                      ) : 'Tiếp tục'}
                    </Button>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Hoặc</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Đăng nhập Google thất bại')}
                        theme="outline"
                        size="large"
                        // text="continue_with"
                        shape="rectangular"
                        width={272}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        className="h-10 w-[272px] rounded-[2px] bg-[#0A66C2] p-0 font-semibold text-white hover:bg-[#004182]"
                        onClick={handleLinkedInLogin}
                        disabled={isLoading}
                      >
                        <span className="flex h-full w-10 items-center justify-center rounded-l-[2px] bg-white">
                          <img src={linkedinIcon} alt="" className="h-5 w-5" />
                        </span>
                        <span className="flex-1 text-center text-[15px] leading-none">
                          {isLoading ? 'Đang xử lý...' : 'Đăng nhập bằng LinkedIn'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {step === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login_email">Email</Label>
                      <Input id="login_email" type="email" {...loginForm.register('email')} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login_password">Mật khẩu *</Label>
                      <Input
                        id="login_password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        {...loginForm.register('password')}
                        className={loginForm.formState.errors.password ? 'border-red-500' : ''}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang đăng nhập...</span>
                    ) : 'Đăng nhập'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2" onClick={() => { setStep('login-otp'); setError(null); setSuccessMessage(null); }}>
                    Quay lại
                  </Button>
                </div>
              </form>
            )}

            {step === 'login-otp' && (
              <form onSubmit={otpForm.handleSubmit(handleVerifyLoginOtp)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-gray-600">
                    Mã OTP đã được gửi tới <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500">Mã có hiệu lực trong 5 phút.</p>
                  <div className="space-y-2">
                    <Label>Nhập mã OTP (6 số)</Label>
                    <Input type="text" maxLength={6} placeholder="000000"
                      {...otpForm.register('otp')}
                      className={otpForm.formState.errors.otp ? 'border-red-500' : ''} />
                    {otpForm.formState.errors.otp && (
                      <p className="text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendLoginOtp}
                    disabled={isLoading || resendCooldownSeconds > 0}
                    className="p-0 h-auto"
                  >
                    {resendCooldownSeconds > 0 ? `Gửi lại mã sau ${resendCooldownSeconds}s` : 'Gửi lại mã OTP'}
                  </Button>
                </div>
                <div className="mt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang xác thực...</span>
                    ) : 'Xác thực'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2" onClick={handleBack}>
                    Quay lại
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full mt-2 text-sm text-gray-600"
                    onClick={() => { setStep('login'); loginForm.setValue('email', email); setError(null); setSuccessMessage(null); }}
                  >
                    Đăng nhập bằng mật khẩu
                  </Button>
                </div>
              </form>
            )}

            {step === 'register' && mode === 'job_seeker' && (
              <form onSubmit={registerJobSeekerForm.handleSubmit(handleRegisterJobSeeker)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên *</Label>
                    <Input placeholder="Nhập họ và tên" {...registerJobSeekerForm.register('fullName')}
                      className={registerJobSeekerForm.formState.errors.fullName ? 'border-red-500' : ''} />
                    {registerJobSeekerForm.formState.errors.fullName && (
                      <p className="text-sm text-red-600">{registerJobSeekerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...registerJobSeekerForm.register('email')} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input type="tel" placeholder="VD: 0901234567" {...registerJobSeekerForm.register('phone')}
                      className={registerJobSeekerForm.formState.errors.phone ? 'border-red-500' : ''} />
                    {registerJobSeekerForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">{registerJobSeekerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu *</Label>
                    <Input type="password" placeholder="6-20 ký tự, gồm chữ hoa, thường và số"
                      {...registerJobSeekerForm.register('password')}
                      className={registerJobSeekerForm.formState.errors.password ? 'border-red-500' : ''} />
                    {registerJobSeekerForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{registerJobSeekerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu *</Label>
                    <Input type="password" placeholder="Nhập lại mật khẩu"
                      {...registerJobSeekerForm.register('confirmPassword')}
                      className={registerJobSeekerForm.formState.errors.confirmPassword ? 'border-red-500' : ''} />
                    {registerJobSeekerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{registerJobSeekerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang tạo tài khoản...</span>
                    ) : 'Hoàn tất'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2" onClick={handleBack}>Quay lại</Button>
                </div>
              </form>
            )}

            {step === 'register' && mode === 'employer' && (
              <form onSubmit={registerCompanyForm.handleSubmit(handleRegisterCompany)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Tên công ty <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Input placeholder="Nhập tên công ty" {...registerCompanyForm.register('companyName')}
                      className={registerCompanyForm.formState.errors.companyName ? 'border-red-500' : ''} />
                    {registerCompanyForm.formState.errors.companyName && (
                      <p className="text-sm text-red-600">{registerCompanyForm.formState.errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Email <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Input type="email" {...registerCompanyForm.register('email')} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Số điện thoại <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      type="tel"
                      placeholder="VD: 0901234567"
                      {...registerCompanyForm.register('phone')}
                      className={registerCompanyForm.formState.errors.phone ? 'border-red-500' : ''}
                    />
                    {registerCompanyForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">{registerCompanyForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://company.com" {...registerCompanyForm.register('website')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả công ty</Label>
                    <Input placeholder="Mô tả ngắn về công ty" {...registerCompanyForm.register('description')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo công ty</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Input type="password" placeholder="6-20 ký tự, gồm chữ hoa, thường và số"
                      {...registerCompanyForm.register('password')}
                      className={registerCompanyForm.formState.errors.password ? 'border-red-500' : ''} />
                    {registerCompanyForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{registerCompanyForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Xác nhận mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Input type="password" placeholder="Nhập lại mật khẩu"
                      {...registerCompanyForm.register('confirmPassword')}
                      className={registerCompanyForm.formState.errors.confirmPassword ? 'border-red-500' : ''} />
                    {registerCompanyForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{registerCompanyForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang đăng ký...</span>
                    ) : 'Đăng ký'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2" onClick={handleBack}>Quay lại</Button>
                </div>
              </form>
            )}

            {step === 'verify-otp' && (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-gray-600">
                    Mã OTP đã được gửi tới <strong>{email}</strong>
                  </p>
                  <div className="space-y-2">
                    <Label>Nhập mã OTP (6 số)</Label>
                    <Input type="text" maxLength={6} placeholder="000000"
                      {...otpForm.register('otp')}
                      className={otpForm.formState.errors.otp ? 'border-red-500' : ''} />
                    {otpForm.formState.errors.otp && (
                      <p className="text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>
                  <Button type="button" variant="link" onClick={handleResendOtp} disabled={isLoading}>
                    Gửi lại mã OTP
                  </Button>
                </div>
                <div className="mt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Đang xác thực...</span>
                    ) : 'Xác thực'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="hidden md:block bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
            <div className="h-full flex flex-col justify-center text-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ỨNG TUYỂN 1 CHẠM</h3>
                <p className="text-gray-600 mb-4">MỌI LÚC MỌI NƠI</p>
                <p className="text-sm text-gray-500">Dành cho {modeText}</p>
              </div>
              <img src="/logo/logo_header.png" alt="JobsNow Logo" className="w-full mx-auto mb-4" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}