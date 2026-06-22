"use client";
import { useAuthStore, ROLE_LABELS } from "@/store/auth";
import { Card, CardHeader } from "@/components/ui/card";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader title="Account" subtitle="Your profile and role information" />
        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-display text-lg font-semibold">
              {user ? initials(user.full_name) : "—"}
            </div>
            <div>
              <div className="font-semibold">{user?.full_name}</div>
              <div className="text-sm text-muted">{user?.email}</div>
              <div className="text-xs text-accent mt-0.5">{user ? ROLE_LABELS[user.role] : ""}</div>
            </div>
          </div>
          {[
            ["Branch", user?.branch_id ? `Branch #${user.branch_id}` : "All branches"],
            ["Role", user ? ROLE_LABELS[user.role] : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-line last:border-0">
              <span className="text-sm text-muted">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Demo credentials" subtitle="All roles share password: Demo@123" />
        <div className="px-5 pb-5 grid grid-cols-2 gap-2 text-xs">
          {[
            ["Super Admin", "admin@autocrm.in"],
            ["Branch Manager", "manager.chg@autocrm.in"],
            ["Sales Executive", "sales1@autocrm.in"],
            ["Service Advisor", "service1@autocrm.in"],
            ["Finance Executive", "finance1@autocrm.in"],
            ["Customer Support", "support1@autocrm.in"],
          ].map(([role, email]) => (
            <div key={email} className="border border-line rounded-[var(--radius-sm)] p-2.5">
              <div className="font-medium text-text">{role}</div>
              <div className="text-muted mt-0.5">{email}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
