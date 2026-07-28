// src/store/auth.store.ts
import { Role } from "@/src/types/enums";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string; // Thêm nếu có
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  deviceId: string | null;
  isLoading: boolean; // Thêm loading state

  // Actions
  setUser: (user: User) => void;
  setDeviceId: (deviceId: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;

  // Getters (computed)
  isAdmin: () => boolean;
  isUser: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      deviceId: null,
      isLoading: true, // Mặc định đang loading

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      setDeviceId: (deviceId) => set({ deviceId }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        // Xóa localStorage
        localStorage.removeItem("auth-storage");
        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          deviceId: null,
          isLoading: false,
        });
      },

      // Getters
      isAdmin: () => {
        const state = get();
        return state.user?.role === Role.ADMIN;
      },

      isUser: () => {
        const state = get();
        return state.user?.role === Role.USER;
      },
    }),
    {
      name: "auth-storage",
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        deviceId: state.deviceId,
        // Không persist isLoading
      }),
    },
  ),
);

// Custom hook để sử dụng dễ dàng hơn
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    deviceId,
    isLoading,
    setUser,
    setDeviceId,
    logout,
    isAdmin,
    isUser,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    deviceId,
    isLoading,
    setUser,
    setDeviceId,
    logout,
    isAdmin: isAdmin(),
    isUser: isUser(),
  };
};
