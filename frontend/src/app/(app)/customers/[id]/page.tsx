"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { initials, formatDate, formatDateTime } from "@/lib/utils";
import {
  Phone, Mail, MapPin, Car, Wrench, FileWarning, Landmark, ShieldCheck,
  MessageSquare, Clock,
} from "lucide-react";

interface Customer360 {
  customer: { id: number; full_name: string; email?: string; phone: string; city?: string; state?: string; occupation?: string };
  leads_count: number;
  vehicles_owned: number[];
  test_drives: number;
  bookings: number;
  service_jobs: number;
  loans: number;
  insurance_policies: number;
  tickets: number;
  timeline: { type: string; date: string; detail: string }[];
}

const TYPE_ICON: Record<string, any> = {
  lead: MessageSquare, test_drive: Car, booking: Car, service: Wrench,
  ticket: FileWarning, communication: MessageSquare,
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery<Customer360>({
    queryKey: ["customer-360", id],
    queryFn: async () => (await api.get(`/customers/${id}/360`)).data,
  });

  if (isLoading || !data) {
    return <div className="h-96 flex items-center justify-center text-muted text-sm">Loading customer profile…</div>;
  }

  const c = data.customer;

  const stats = [
    { label: "Vehicles Owned", value: data.vehicles_owned.length, icon: Car },
    { label: "Test Drives", value: data.test_drives, icon: Car },
    { label: "Bookings", value: data.bookings, icon: Car },
    { label: "Service Jobs", value: data.service_jobs, icon: Wrench },
    { label: "Loans", value: data.loans, icon: Landmark },
    { label: "Insurance Policies", value: data.insurance_policies, icon: ShieldCheck },
    { label: "Support Tickets", value: data.tickets, icon: FileWarning },
  ];

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center text-xl font-display font-semibold shrink-0">
            {initials(c.full_name)}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">{c.full_name}</h2>
            <p className="text-xs text-muted mt-0.5">{c.occupation || "Customer"} · {data.leads_count} lead(s) on record</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
              {c.email && <span className="flex items-center gap-1.5 text-muted"><Mail className="w-3.5 h-3.5" /> {c.email}</span>}
              {c.city && <span className="flex items-center gap-1.5 text-muted"><MapPin className="w-3.5 h-3.5" /> {c.city}, {c.state}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="w-4 h-4 text-accent mb-2" />
            <div className="font-display text-lg font-semibold tabular">{s.value}</div>
            <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader title="Interaction Timeline" subtitle="Every touchpoint, chronologically" />
        <div className="px-5 pb-5">
          {data.timeline.length === 0 && <p className="text-sm text-muted py-6 text-center">No interactions recorded yet.</p>}
          <ol className="space-y-0">
            {data.timeline.map((item, i) => {
              const Icon = TYPE_ICON[item.type] || Clock;
              return (
                <li key={i} className="flex gap-3 pb-5 relative">
                  {i < data.timeline.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />}
                  <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center shrink-0 z-10">
                    <Icon className="w-3.5 h-3.5 text-muted" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-text">{item.detail}</p>
                    <p className="text-[11px] text-muted-soft mt-0.5">{formatDateTime(item.date)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>
    </div>
  );
}
