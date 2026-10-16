import { createContext, useContext, useState, type ReactNode } from 'react';
import { LoginModal } from '@/components/auth/LoginModal';

type RoleMode = 'job_seeker' | 'employer';

interface AuthModalContextType {
  openLoginModal: (mode?: RoleMode) => void;
  closeLoginModal: () => void;
  isOpen: boolean;
  mode: RoleMode;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<RoleMode>('job_seeker');

  const openLoginModal = (newMode: RoleMode = 'job_seeker') => {
    setMode(newMode);
    setIsOpen(true);
  };

  const closeLoginModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openLoginModal, closeLoginModal, isOpen, mode }}>
      {children}
      <LoginModal open={isOpen} onOpenChange={setIsOpen} mode={mode} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
