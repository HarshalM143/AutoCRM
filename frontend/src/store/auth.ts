"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "super_admin"
  | "branch_manager"
  | "sales_executive"
  | "service_advisor"
  | "finance_executive"
  | "customer_support";

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  branch_id: number | null;
  avatar_url: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: CurrentUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "autocrm-auth" }
  )
);

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  branch_manager: "Branch Manager",
  sales_executive: "Sales Executive",
  service_advisor: "Service Advisor",
  finance_executive: "Finance Executive",
  customer_support: "Customer Support",
};
