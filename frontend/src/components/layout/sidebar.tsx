"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserSquare2, Car, CalendarClock, FileText,
  Wrench, Landmark, LifeBuoy, Settings, ShieldCheck, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: "all" },
  { href: "/leads", label: "Leads", icon: Users, roles: "all" },
  { href: "/customers", label: "Customers", icon: UserSquare2, roles: "all" },
  { href: "/inventory", label: "Inventory", icon: Car, roles: "all" },
  { href: "/test-drives", label: "Test Drives", icon: CalendarClock, roles: "all" },
  { href: "/quotations", label: "Quotations", icon: FileText, roles: "all" },
  { href: "/service", label: "Service", icon: Wrench, roles: "all" },
  { href: "/finance", label: "Finance", icon: Landmark, roles: "all" },
  { href: "/support", label: "Support", icon: LifeBuoy, roles: "all" },
  { href: "/ai", label: "AI Assistant", icon: Sparkles, roles: "all" },
  { href: "/audit-logs", label: "Audit Logs", icon: ShieldCheck, roles: ["super_admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: "all" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV.filter((n) => n.roles === "all" || (user && n.roles.includes(user.role)));

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-ink text-white flex flex-col border-r border-ink-line transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[228px]"
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-ink-line shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center font-display font-bold text-sm shrink-0">A</div>
        {!collapsed && <span className="font-display font-semibold tracking-tight">AutoCRM</span>}
      </div>

      <nav className="flex-1 overflow-y-auto scroll-thin py-3 px-2 space-y-0.5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors group relative",
                active ? "bg-white/10 text-white" : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent" />}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center gap-2 h-11 border-t border-ink-line text-white/40 hover:text-white text-xs"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
      </button>
    </aside>
  );
}
