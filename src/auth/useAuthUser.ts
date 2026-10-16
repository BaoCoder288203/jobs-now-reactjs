import { useAppSelector } from '@/app/hooks';
import type { User } from '@/types';

export function useAuthUser(): User | null {
    return useAppSelector((state) => state.auth.user);
}

export function useAuth() {
    return useAppSelector((state) => state.auth);
}
