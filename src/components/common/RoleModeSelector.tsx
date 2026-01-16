import { useState } from 'react';
import { Briefcase, Users } from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';

type RoleMode = 'job_seeker' | 'employer';

interface RoleModeSelectorProps {
  onModeChange?: (mode: RoleMode) => void;
}

export function RoleModeSelector({ onModeChange }: RoleModeSelectorProps) {
  const [mode, setMode] = useState<RoleMode>('job_seeker');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModeChange = (newMode: RoleMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Left Side: Text with mode selector - Click to open modal */}
        <button
          onClick={handleLoginClick}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <p className="text-xs font-medium text-gray-500">
            {mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng'}
          </p>
          <p className="text-sm font-medium text-gray-900">Đăng nhập / Đăng ký</p>
        </button>

        {/* Right Side: Logo + "Dành cho..." - Click to change mode */}
        <button
          onClick={() => handleModeChange(mode === 'job_seeker' ? 'employer' : 'job_seeker')}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {mode === 'employer' ? (
            <Briefcase className="h-6 w-6 text-gray-900" />
          ) : (
            <Users className="h-6 w-6 text-gray-900" />
          )}
          <div className="text-left">
            <p className="text-xs font-medium text-gray-500">Dành cho</p>
            <p className="text-sm font-medium text-gray-900">
              {mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng'}
            </p>
          </div>
        </button>
      </div>

      {/* Login Modal - Mode được truyền vào và tự động cập nhật */}
      <LoginModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        mode={mode}
      />
    </>
  );
}

