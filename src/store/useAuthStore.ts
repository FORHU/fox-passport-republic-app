import { create } from 'zustand';

type AuthView = 'login' | 'signup';

interface AuthState {
  isOpen: boolean;
  view: AuthView;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  toggleView: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openSignup: () => set({ isOpen: true, view: 'signup' }),
  close: () => set({ isOpen: false }),
  toggleView: () => set((state) => ({ 
    view: state.view === 'login' ? 'signup' : 'login' 
  })),
}));