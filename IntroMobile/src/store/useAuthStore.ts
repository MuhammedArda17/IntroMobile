import { create } from "zustand";

interface User {
  uid: string;
  email: string;
  name: string;
  level: number;
  gender: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
