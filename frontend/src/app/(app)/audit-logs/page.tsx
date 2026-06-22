"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await api.get("/audit-logs?limit=100")).data,
  });
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">User ID</th>
              <th className="px-5 py-3 font-medium">Details</th>
              <th className="px-5 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading audit logs…</td></tr>}
            {(logs || []).map((l: { id: number; action: string; entity_type?: string; entity_id?: string; user_id?: number; details?: string; timestamp: string }) => (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                <td className="px-5 py-3 flex items-center gap-1.5 pt-3.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span className="font-medium capitalize">{l.action.replace(/_/g, " ")}</span>
                </td>
                <td className="px-5 py-3 text-muted capitalize">{l.entity_type || "—"} {l.entity_id ? `#${l.entity_id}` : ""}</td>
                <td className="px-5 py-3 text-muted">{l.user_id ?? "—"}</td>
                <td className="px-5 py-3 text-muted max-w-[200px] truncate">{l.details || "—"}</td>
                <td className="px-5 py-3 text-muted">{formatDateTime(l.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
