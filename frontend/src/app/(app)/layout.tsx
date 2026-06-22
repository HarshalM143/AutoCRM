"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "Executive Dashboard",
  "/leads": "Lead Management",
  "/customers": "Customers",
  "/inventory": "Vehicle Inventory",
  "/test-drives": "Test Drives",
  "/quotations": "Quotations",
  "/service": "Service Management",
  "/finance": "Finance & Insurance",
  "/support": "Customer Support",
  "/ai": "AI Assistant",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

function resolveTitle(pathname: string) {
  const match = Object.keys(TITLES).find((k) => pathname.startsWith(k));
  return match ? TITLES[match] : "AutoCRM";
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [accessToken, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={resolveTitle(pathname)} />
        <main className="p-6 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
