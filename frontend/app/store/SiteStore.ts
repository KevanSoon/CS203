import { create } from 'zustand';

interface SiteState {
    isLoading: boolean;
    // Eventually can make it object for error toasts
    error: string | null;
}

export const useSiteState = create<SiteState>(() => ({
  isLoading: false,
  error: null,
}));