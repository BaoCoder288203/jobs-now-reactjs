import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/app/hooks';
import { loginAsync, registerAsync } from '@/auth/authSlice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Mail, Globe } from 'lucide-react';
import { mockUsers } from '@/mocks/data/users.mock';
import { useNavigate } from 'react-router-dom';

type RoleMode = 'job_seeker' | 'employer';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RoleMode;
}

// Step 1: Check account schema
const checkAccountSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập số điện thoại hoặc email')
});

// Step 2a: Register schema
const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => {
  if (!data.phone && !data.email) {
    return false;
  }
  return true;
}, {
  message: 'Vui lòng nhập số điện thoại hoặc email',
  path: ['phone']
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

// Step 2b: Login schema
const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

type CheckAccountFormData = z.infer<typeof checkAccountSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ open, onOpenChange, mode }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'check' | 'register' | 'login'>('check');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get mode display text
  const modeText = mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng';

  // Check if user exists
  const checkUserExists = (identifier: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);
    
    if (isEmail) {
      return mockUsers.some(u => u.email === identifier);
    } else {
      return mockUsers.some(u => u.phone === identifier);
    }
  };

  // Check account form
  const checkForm = useForm<CheckAccountFormData>({
    resolver: zodResolver(checkAccountSchema)
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: ''
    }
  });

  const handleCheckAccount = async (data: CheckAccountFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exists = checkUserExists(data.identifier);
      setIdentifier(data.identifier);
      
      // Pre-fill forms
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(data.identifier);
      
      if (exists) {
        // User exists - show login form
        loginForm.setValue('identifier', data.identifier);
        setStep('login');
      } else {
        // User doesn't exist - show register form
        if (isEmail) {
          registerForm.setValue('email', data.identifier);
        } else {
          registerForm.setValue('phone', data.identifier);
        }
        setStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { confirmPassword, ...registerData } = data;
      const role = mode === 'job_seeker' ? 'JOB_SEEKER' : 'RECRUITER';
      
      // Ensure email is provided for registration
      if (!registerData.email && !registerData.phone) {
        setError('Vui lòng nhập email hoặc số điện thoại');
        return;
      }
      
      // If phone is provided but no email, use a placeholder email for now
      const email = registerData.email || `${registerData.phone}@jobsnow.local`;
      
      await dispatch(registerAsync({
        email,
        password: registerData.password,
        fullName: registerData.full_name,
        role: role as 'JOB_SEEKER' | 'RECRUITER',
        phone: registerData.phone
      })).unwrap();
      
      const roleName = mode === 'job_seeker' ? 'job-seeker' : 'employer';
      onOpenChange(false);
      navigate(`/${roleName}/dashboard`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Find user by email or phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(data.identifier);
      
      let userEmail = '';
      if (isEmail) {
        userEmail = data.identifier;
      } else {
        const user = mockUsers.find(u => u.phone === data.identifier);
        if (!user) {
          throw new Error('Không tìm thấy tài khoản');
        }
        userEmail = user.email;
      }
      
      await dispatch(loginAsync({
        email: userEmail,
        password: data.password
      })).unwrap();
      
      onOpenChange(false);
      const roleName = mode === 'job_seeker' ? 'job-seeker' : 'employer';
      navigate(`/${roleName}/dashboard`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form has data
  const hasFormData = () => {
    const checkValue = checkForm.watch('identifier');
    const registerValues = registerForm.watch();
    const loginValues = loginForm.watch();
    
    return !!(
      checkValue ||
      registerValues.full_name ||
      registerValues.phone ||
      registerValues.email ||
      registerValues.password ||
      registerValues.confirmPassword ||
      loginValues.identifier ||
      loginValues.password
    );
  };

  const handleClose = () => {
    // Check if user has entered any data
    if (hasFormData()) {
      const confirmed = window.confirm('Bạn có thông tin chưa hoàn thành. Bạn có chắc chắn muốn đóng cửa sổ đăng nhập không?');
      if (!confirmed) {
        return;
      }
    }
    
    setStep('check');
    setIdentifier('');
    setError(null);
    checkForm.reset();
    registerForm.reset();
    loginForm.reset();
    onOpenChange(false);
  };

  const handleDialogOverlayClick = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleBack = () => {
    setStep('check');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOverlayClick}>
      <DialogContent className="p-0" onClose={handleClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          {/* Left: Form */}
          <div className="p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {modeText}
              </h2>
              <p className="text-gray-600">
                {step === 'check' && 'Đăng nhập hoặc Đăng ký'}
                {step === 'register' && 'Tạo tài khoản mới'}
                {step === 'login' && 'Đăng nhập'}
              </p>
              {step === 'register' && (
                <p className="text-sm text-gray-600 mt-1">
                  Để kết nối với các cơ hội việc làm tốt nhất
                </p>
              )}
            </div>

            {step === 'check' && (
              <form onSubmit={checkForm.handleSubmit(handleCheckAccount)} className="flex-1 flex flex-col">
                <div className="flex-1">
                  {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Số điện thoại hoặc Email</Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Nhập số điện thoại của bạn"
                        {...checkForm.register('identifier')}
                        className={checkForm.formState.errors.identifier ? 'border-red-500' : ''}
                      />
                      {checkForm.formState.errors.identifier && (
                        <p className="text-sm text-red-600">
                          {checkForm.formState.errors.identifier.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Đang kiểm tra...
                        </span>
                      ) : (
                        'Tiếp tục'
                      )}
                    </Button>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Hoặc</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      Đăng nhập bằng Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Đăng nhập bằng Email
                    </Button>
                  </div>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  Bằng việc đăng nhập, tôi đồng ý chia sẻ thông tin cá nhân của mình với nhà tuyển dụng theo các{' '}
                  <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>,{' '}
                  <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> và{' '}
                  <a href="#" className="text-primary hover:underline">Chính sách dữ liệu cá nhân</a> của JobsNow.
                </p>
              </form>
            )}

            {step === 'register' && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex-1 flex flex-col">
                <div className="flex-1">
                  {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Họ và tên *</Label>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Nhập họ và tên"
                        {...registerForm.register('full_name')}
                        className={registerForm.formState.errors.full_name ? 'border-red-500' : ''}
                      />
                      {registerForm.formState.errors.full_name && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {identifier && !identifier.includes('@') && (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          {...registerForm.register('phone')}
                          defaultValue={identifier}
                          className={registerForm.formState.errors.phone ? 'border-red-500' : ''}
                        />
                        {registerForm.formState.errors.phone && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    )}

                    {identifier && identifier.includes('@') && (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Nhập email của bạn"
                          {...registerForm.register('email')}
                          defaultValue={identifier}
                          className={registerForm.formState.errors.email ? 'border-red-500' : ''}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        {...registerForm.register('password')}
                        className={registerForm.formState.errors.password ? 'border-red-500' : ''}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        {...registerForm.register('confirmPassword')}
                        className={registerForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Đang tạo tài khoản...
                      </span>
                    ) : (
                      'Hoàn tất'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={handleBack}
                  >
                    Quay lại
                  </Button>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  Bằng việc đăng nhập, tôi đồng ý chia sẻ thông tin cá nhân của mình với nhà tuyển dụng theo các{' '}
                  <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>,{' '}
                  <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> và{' '}
                  <a href="#" className="text-primary hover:underline">Chính sách dữ liệu cá nhân</a> của JobsNow.
                </p>
              </form>
            )}

            {step === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex-1 flex flex-col">
                <div className="flex-1">
                  {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login_identifier">Tên đăng nhập</Label>
                      <Input
                        id="login_identifier"
                        type="text"
                        placeholder="Số điện thoại hoặc email"
                        {...loginForm.register('identifier')}
                        defaultValue={identifier}
                        className={loginForm.formState.errors.identifier ? 'border-red-500' : ''}
                        readOnly
                      />
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
                        <p className="text-sm text-red-600">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Đang đăng nhập...
                      </span>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={handleBack}
                  >
                    Quay lại
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Promotional Banner */}
          <div className="hidden md:block bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
            <div className="text-center">
              <img 
                src="/logo/logo_header.png" 
                alt="JobsNow Logo" 
                className="h-12 w-auto mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ỨNG TUYỂN 1 CHẠM
              </h3>
              <p className="text-gray-600 mb-4">MỌI LÚC MỌI NƠI</p>
              {/* Hiển thị text theo mode */}
              <p className="text-sm text-gray-500">
                Dành cho {modeText}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

