"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { LifeBuoy, Clock, AlertTriangle, Plus, X } from "lucide-react";

interface Ticket {
  id: number; ticket_number: string; customer_id: number; subject: string;
  category?: string; priority: string; status: string; sla_due_at?: string; created_at: string;
}

function NewTicketModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");

  const mut = useMutation({
    mutationFn: () => api.post("/tickets", { customer_id: Number(customerId), subject, description, priority, category }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tickets"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-[var(--radius-md)] w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Raise Support Ticket</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Customer ID</label>
            <input type="number" value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm" placeholder="e.g. 1" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm" placeholder="Describe the issue briefly" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm">
                {["general", "service", "sales", "billing"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm">
                {["low", "medium", "high", "critical"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button disabled={!customerId || !subject || mut.isPending}
            onClick={() => mut.mutate()}
            className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition disabled:opacity-50">
            {mut.isPending ? "Creating…" : "Create ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isSLABreached(sla_due?: string) {
  return sla_due && new Date(sla_due) < new Date();
}

export default function SupportPage() {
  const [filterStatus, setFilterStatus] = useState("");
  const [showNew, setShowNew] = useState(false);

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets", filterStatus],
    queryFn: async () => (await api.get(`/tickets${filterStatus ? `?status=${filterStatus}` : ""}`)).data,
  });

  const stats = {
    open: (tickets || []).filter((t) => t.status === "open").length,
    inProgress: (tickets || []).filter((t) => t.status === "in_progress").length,
    escalated: (tickets || []).filter((t) => t.status === "escalated").length,
    resolved: (tickets || []).filter((t) => ["resolved", "closed"].includes(t.status)).length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open", value: stats.open, color: "text-red", icon: LifeBuoy },
          { label: "In Progress", value: stats.inProgress, color: "text-amber", icon: Clock },
          { label: "Escalated", value: stats.escalated, color: "text-red", icon: AlertTriangle },
          { label: "Resolved", value: stats.resolved, color: "text-teal", icon: LifeBuoy },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
            <div className={`font-display text-xl font-semibold tabular ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted mt-0.5">{s.label} tickets</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {["", "open", "in_progress", "escalated", "resolved", "closed"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filterStatus === s ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-accent"}`}>
              {s ? s.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-3.5 py-2 rounded-[var(--radius-sm)] hover:bg-accent transition">
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Ticket #</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">SLA Due</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">Loading tickets…</td></tr>}
              {(tickets || []).map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3 font-medium tabular flex items-center gap-1.5 pt-3.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-accent shrink-0" /> {t.ticket_number}
                  </td>
                  <td className="px-5 py-3 max-w-[240px] truncate">{t.subject}</td>
                  <td className="px-5 py-3 text-muted capitalize">{t.category || "—"}</td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[t.priority]}>{t.priority}</Badge></td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[t.status]}>{t.status.replace("_", " ")}</Badge></td>
                  <td className="px-5 py-3">
                    <span className={`text-xs ${isSLABreached(t.sla_due_at) ? "text-red font-medium" : "text-muted"}`}>
                      {t.sla_due_at ? formatDateTime(t.sla_due_at) : "—"}
                      {isSLABreached(t.sla_due_at) && " ⚠"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
