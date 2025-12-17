import { create } from 'zustand';

type AuthView = 'login' | 'signup';

interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null; // Replace 'any' with your User type if you have one
  isOpen: boolean;
  view: AuthView;

  // Actions
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  toggleView: () => void;
  setLoading: (loading: boolean) => void;
  login: (userData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true, // Default to true to check session on load
  user: null,
  isOpen: false,
  view: 'login',

  openLogin: () => set({ isOpen: true, view: 'login' }),
  openSignup: () => set({ isOpen: true, view: 'signup' }),
  close: () => set({ isOpen: false }),
  toggleView: () => set((state) => ({ 
    view: state.view === 'login' ? 'signup' : 'login' 
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  
  login: (userData) => {
    // Save to local storage if needed
    localStorage.setItem('fox_user', JSON.stringify(userData)); 
    set({ isAuthenticated: true, user: userData, isOpen: false });
  },

  logout: () => {
    localStorage.removeItem('fox_user');
    set({ isAuthenticated: false, user: null });
  },
}));

// --- SELECTORS (Hooks for clean usage) ---
export const useAuthStatus = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => {
    const { openLogin, openSignup, logout, setLoading, login } = useAuthStore();
    return { openLogin, openSignup, logout, setLoading, login };
};