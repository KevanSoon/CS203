import { create } from 'zustand';
import { persist, devtools } from "zustand/middleware";

interface UserInfo {
    username: string;
    email: string;
    usertype: string;
    profilePictureUrl?: string;
}

interface SiteState {
    isLoading: boolean;
    // Eventually can make it object for error toasts
    error: string | null;
    user: UserInfo | null;
    _hasHydrated: boolean;
    setUser: (user: UserInfo | null) => void;
    clearUser: () => void;
    setHasHydrated: (value: boolean) => void;
}

export const useSiteState = create<SiteState>()(
  devtools(
    persist(
      (set) => ({
        isLoading: false,
        error: null,
        user: null,
        _hasHydrated: false,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      {
        name: 'site-storage',
        // Exclude profilePictureUrl from persist — signed URLs expire, so we
        // always fetch a fresh one from the API on each session.
        partialize: (state) => ({
          user: state.user
            ? { username: state.user.username, email: state.user.email, usertype: state.user.usertype }
            : null,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  )
);