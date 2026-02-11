import { create } from 'zustand';

interface UserInfo {
    username: string;
    email: string;
    usertype: string;
}

interface SiteState {
    isLoading: boolean;
    // Eventually can make it object for error toasts
    error: string | null;
    user: UserInfo | null;
    setUser: (user: UserInfo | null) => void;
    clearUser: () => void;
}

export const useSiteState = create<SiteState>((set) => ({
  isLoading: false,
  error: null,
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));