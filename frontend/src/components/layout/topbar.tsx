"use client";
import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, Moon } from "lucide-react";
import { useAuthStore, ROLE_LABELS } from "@/store/auth";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    refetchInterval: 60_000,
  });
  const unread = notifications?.filter((n: { is_read: boolean }) => !n.is_read).length || 0;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="h-16 sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-line flex items-center justify-between px-6 gap-4">
      <div>
        <h1 className="font-display text-[17px] font-semibold text-text">{title}</h1>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
          <input
            placeholder="Search customers, leads, vehicles…"
            className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-paper border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 rounded-full hover:bg-paper flex items-center justify-center text-muted relative">
          <Bell className="w-[18px] h-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-card" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius-sm)] hover:bg-paper transition"
          >
            <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-medium">
              {user ? initials(user.full_name) : "—"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium leading-tight">{user?.full_name}</div>
              <div className="text-[10px] text-muted leading-tight">{user ? ROLE_LABELS[user.role] : ""}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-soft" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-line rounded-[var(--radius-md)] shadow-lg py-1.5 z-30">
              <div className="px-3 py-2 border-b border-line">
                <div className="text-xs font-medium">{user?.email}</div>
              </div>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-paper flex items-center gap-2 text-muted">
                <Moon className="w-3.5 h-3.5" /> Appearance
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-red-soft text-red flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
