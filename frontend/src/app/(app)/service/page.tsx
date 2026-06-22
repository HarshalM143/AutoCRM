"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Wrench, Package } from "lucide-react";

interface ServiceJob {
  id: number; job_card_number: string; customer_id: number; service_type: string;
  status: string; scheduled_at: string; estimated_cost?: number; final_cost?: number;
}
interface SparePart { id: number; name: string; part_number: string; stock_quantity: number; low_stock_threshold: number; unit_price: number; }

export default function ServicePage() {
  const { data: jobs, isLoading } = useQuery<ServiceJob[]>({ queryKey: ["service-jobs"], queryFn: async () => (await api.get("/service/jobs")).data });
  const { data: parts } = useQuery<SparePart[]>({ queryKey: ["spare-parts"], queryFn: async () => (await api.get("/service/parts")).data });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Job Cards" subtitle="Service bookings across the booked → delivered workflow" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Job Card</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading service jobs…</td></tr>}
              {(jobs || []).map((j) => (
                <tr key={j.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3 flex items-center gap-1.5 font-medium tabular"><Wrench className="w-3.5 h-3.5 text-accent" />{j.job_card_number}</td>
                  <td className="px-5 py-3 text-muted">{j.service_type}</td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(j.scheduled_at)}</td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[j.status]}>{j.status.replace("_", " ")}</Badge></td>
                  <td className="px-5 py-3 tabular">{formatCurrency(j.final_cost || j.estimated_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Spare Parts Inventory" subtitle="Stock levels and low-stock alerts" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-5">
          {(parts || []).map((p) => {
            const low = p.stock_quantity <= p.low_stock_threshold;
            return (
              <div key={p.id} className="border border-line rounded-[var(--radius-sm)] p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-paper flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-[11px] text-muted tabular">{p.part_number}</div>
                  </div>
                </div>
                <div className={`text-sm font-display font-semibold tabular ${low ? "text-red" : ""}`}>{p.stock_quantity}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
