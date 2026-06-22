"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { formatDateTime, initials } from "@/lib/utils";
import { Customer, Vehicle } from "@/types";
import { Star, Car as CarIcon } from "lucide-react";

interface TestDrive {
  id: number; customer_id: number; vehicle_id: number; scheduled_at: string;
  status: string; route?: string; rating?: number | null; feedback?: string | null;
}

export default function TestDrivesPage() {
  const { data: testDrives, isLoading } = useQuery<TestDrive[]>({
    queryKey: ["test-drives"], queryFn: async () => (await api.get("/test-drives")).data,
  });
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["customers-all"], queryFn: async () => (await api.get("/customers?limit=200")).data });
  const { data: vehicles } = useQuery<Vehicle[]>({ queryKey: ["vehicles-all"], queryFn: async () => (await api.get("/vehicles?limit=200")).data });

  const customerMap = useMemo(() => Object.fromEntries((customers || []).map((c) => [c.id, c])), [customers]);
  const vehicleMap = useMemo(() => Object.fromEntries((vehicles || []).map((v) => [v.id, v])), [vehicles]);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Vehicle</th>
              <th className="px-5 py-3 font-medium">Scheduled</th>
              <th className="px-5 py-3 font-medium">Route</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Loading test drives…</td></tr>}
            {(testDrives || []).map((td) => (
              <tr key={td.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-medium">
                      {initials(customerMap[td.customer_id]?.full_name || "?")}
                    </div>
                    {customerMap[td.customer_id]?.full_name || `#${td.customer_id}`}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted flex items-center gap-1.5 pt-3.5"><CarIcon className="w-3.5 h-3.5" /> {vehicleMap[td.vehicle_id]?.model_name} {vehicleMap[td.vehicle_id]?.variant}</td>
                <td className="px-5 py-3 text-muted">{formatDateTime(td.scheduled_at)}</td>
                <td className="px-5 py-3 text-muted">{td.route || "—"}</td>
                <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[td.status]}>{td.status.replace("_", " ")}</Badge></td>
                <td className="px-5 py-3 text-muted">
                  {td.rating ? (
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber fill-amber" /> {td.rating}/5</span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
