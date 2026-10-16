import { useState } from 'react';
import { Briefcase, Users } from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';

type RoleMode = 'job_seeker' | 'employer';

interface RoleModeSelectorProps {
  onModeChange?: (mode: RoleMode) => void;
  /** Thu gọn: chỉ hiện icon, ẩn text "Dành cho" / "Người tìm việc" */
  compact?: boolean;
  stacked?: boolean;
}

export function RoleModeSelector({ onModeChange, compact = false, stacked = false }: RoleModeSelectorProps) {
  const [mode, setMode] = useState<RoleMode>('job_seeker');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModeChange = (newMode: RoleMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleStackedLogin = (nextMode: RoleMode) => {
    handleModeChange(nextMode);
    setIsModalOpen(true);
  };

  return (
    <>
      {stacked ? (
        <div className="flex w-full flex-col gap-2">
          <button
            onClick={() => handleStackedLogin('job_seeker')}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-900" />
              <p className="text-sm font-medium text-gray-900">Người tìm việc</p>
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500">Đăng nhập / Đăng ký</p>
          </button>

          <button
            onClick={() => handleStackedLogin('employer')}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-900" />
              <p className="text-sm font-medium text-gray-900">Nhà tuyển dụng</p>
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500">Đăng nhập / Đăng ký</p>
          </button>
        </div>
      ) : (
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

        {/* Right Side: Logo + "Dành cho..." - Click to change mode. compact = chỉ icon */}
        <button
          onClick={() => handleModeChange(mode === 'job_seeker' ? 'employer' : 'job_seeker')}
          className={`flex items-center rounded-lg hover:bg-gray-100 transition-colors ${compact ? 'p-2' : 'gap-2 px-3 py-2'}`}
          title={compact ? (mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng') : undefined}
        >
          {mode === 'employer' ? (
            <Briefcase className="h-6 w-6 text-gray-900" />
          ) : (
            <Users className="h-6 w-6 text-gray-900" />
          )}
          {!compact && (
            <div className="text-left">
              <p className="text-xs font-medium text-gray-500">Dành cho</p>
              <p className="text-sm font-medium text-gray-900">
                {mode === 'job_seeker' ? 'Người tìm việc' : 'Nhà tuyển dụng'}
              </p>
            </div>
          )}
        </button>
      </div>
      )}

      {/* Login Modal - Mode được truyền vào và tự động cập nhật */}
      <LoginModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={mode}
      />
    </>
  );
}

