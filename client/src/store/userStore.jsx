import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isUserLoading: false,
      authToken: null,
      isUserAdmin: false,
      setUser: (userData) => set({ user: userData }),
      setIsLoggedIn: (val) => set({ isLoggedIn: !!val }),
      setIsUserLoading: (val) => set({ isUserLoading: !!val }),
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
          authToken: null,
          isUserAdmin: false,
        }),
      setAuthToken: (token) => set({ authToken: token }),
      setIsUserAdmin: (val) => set({ isUserAdmin: !!val }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isUserAdmin: state.isUserAdmin,
      }),
    }
  )
);