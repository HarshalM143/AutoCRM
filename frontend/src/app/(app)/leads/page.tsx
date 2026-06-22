"use client";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { Lead, Customer, Vehicle, UserLite, LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/types";
import { formatDate, initials } from "@/lib/utils";
import { Table2, KanbanSquare, Flame, Plus, X } from "lucide-react";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

function useLookups() {
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["customers-all"], queryFn: async () => (await api.get("/customers?limit=200")).data });
  const { data: vehicles } = useQuery<Vehicle[]>({ queryKey: ["vehicles-all"], queryFn: async () => (await api.get("/vehicles?limit=200")).data });
  const { data: users } = useQuery<UserLite[]>({ queryKey: ["users-all"], queryFn: async () => (await api.get("/users")).data, retry: false });

  const customerMap = useMemo(() => Object.fromEntries((customers || []).map((c) => [c.id, c])), [customers]);
  const vehicleMap = useMemo(() => Object.fromEntries((vehicles || []).map((v) => [v.id, v])), [vehicles]);
  const userMap = useMemo(() => Object.fromEntries((users || []).map((u) => [u.id, u])), [users]);

  return { customerMap, vehicleMap, userMap, customers, vehicles, users };
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#0EA894" : score >= 40 ? "#F2A93B" : "#E0464C";
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="h-1.5 flex-1 bg-paper rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] tabular text-muted w-6">{score}</span>
    </div>
  );
}

function NewLeadModal({ onClose, customers, vehicles }: { onClose: () => void; customers?: Customer[]; vehicles?: Vehicle[] }) {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [source, setSource] = useState("website");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post("/leads", {
        customer_id: Number(customerId),
        interested_vehicle_id: vehicleId ? Number(vehicleId) : null,
        source,
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-[var(--radius-md)] w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">New Lead</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm">
              <option value="">Select customer…</option>
              {customers?.map((c) => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Interested vehicle</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm">
              <option value="">Select vehicle…</option>
              {vehicles?.map((v) => <option key={v.id} value={v.id}>{v.model_name} {v.variant}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm">
              {["website", "walk_in", "referral", "social_media", "call_center", "event", "partner"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm" rows={3} />
          </div>
          <button
            disabled={!customerId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ lead, customerName, vehicleName }: { lead: Lead; customerName: string; vehicleName: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-card border border-line rounded-[var(--radius-sm)] p-3 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-60 shadow-lg" : ""}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-text truncate">{customerName}</span>
        {lead.score >= 70 && <Flame className="w-3.5 h-3.5 text-amber shrink-0" />}
      </div>
      <p className="text-xs text-muted truncate mb-2">{vehicleName}</p>
      <ScoreBar score={lead.score} />
    </div>
  );
}

function KanbanColumn({ status, leads, customerMap, vehicleMap }: { status: string; leads: Lead[]; customerMap: Record<number, Customer>; vehicleMap: Record<number, Vehicle> }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={`w-[260px] shrink-0 rounded-[var(--radius-md)] p-2.5 ${isOver ? "bg-accent-soft" : "bg-paper"}`}>
      <div className="flex items-center justify-between px-1.5 py-1.5 mb-1">
        <span className="text-xs font-semibold text-text">{LEAD_STATUS_LABELS[status]}</span>
        <span className="text-[11px] text-muted tabular bg-card border border-line rounded-full px-1.5 py-0.5">{leads.length}</span>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scroll-thin pr-0.5">
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            customerName={customerMap[lead.customer_id]?.full_name || `Customer #${lead.customer_id}`}
            vehicleName={lead.interested_vehicle_id ? `${vehicleMap[lead.interested_vehicle_id]?.model_name || ""} ${vehicleMap[lead.interested_vehicle_id]?.variant || ""}` : "—"}
          />
        ))}
        {leads.length === 0 && <div className="text-[11px] text-muted-soft text-center py-6">No leads</div>}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [showNew, setShowNew] = useState(false);
  const qc = useQueryClient();
  const { customerMap, vehicleMap, userMap, customers, vehicles } = useLookups();

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => (await api.get("/leads")).data,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => api.put(`/leads/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData<Lead[]>(["leads"]);
      qc.setQueryData<Lead[]>(["leads"], (old) => old?.map((l) => (l.id === id ? { ...l, status } : l)));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["leads"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = Number(active.id);
    const newStatus = String(over.id);
    const lead = leads?.find((l) => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      updateStatus.mutate({ id: leadId, status: newStatus });
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, Lead[]> = Object.fromEntries(LEAD_STATUSES.map((s) => [s, []]));
    (leads || []).forEach((l) => g[l.status]?.push(l));
    return g;
  }, [leads]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex bg-paper border border-line rounded-[var(--radius-sm)] p-0.5">
          <button onClick={() => setView("kanban")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition ${view === "kanban" ? "bg-card shadow-sm text-text" : "text-muted"}`}>
            <KanbanSquare className="w-3.5 h-3.5" /> Pipeline
          </button>
          <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition ${view === "table" ? "bg-card shadow-sm text-text" : "text-muted"}`}>
            <Table2 className="w-3.5 h-3.5" /> Table
          </button>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-3.5 py-2 rounded-[var(--radius-sm)] hover:bg-accent transition">
          <Plus className="w-3.5 h-3.5" /> New Lead
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center text-muted text-sm">Loading leads…</div>
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto scroll-thin pb-3">
            {LEAD_STATUSES.map((status) => (
              <KanbanColumn key={status} status={status} leads={grouped[status]} customerMap={customerMap} vehicleMap={vehicleMap} />
            ))}
          </div>
        </DndContext>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Assigned to</th>
                  <th className="px-5 py-3 font-medium">Next follow-up</th>
                </tr>
              </thead>
              <tbody>
                {(leads || []).map((lead) => (
                  <tr key={lead.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                          {initials(customerMap[lead.customer_id]?.full_name || "?")}
                        </div>
                        <span className="font-medium">{customerMap[lead.customer_id]?.full_name || `#${lead.customer_id}`}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {lead.interested_vehicle_id ? `${vehicleMap[lead.interested_vehicle_id]?.model_name || ""} ${vehicleMap[lead.interested_vehicle_id]?.variant || ""}` : "—"}
                    </td>
                    <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge></td>
                    <td className="px-5 py-3 text-muted capitalize">{lead.source.replace("_", " ")}</td>
                    <td className="px-5 py-3"><ScoreBar score={lead.score} /></td>
                    <td className="px-5 py-3 text-muted">{lead.assigned_to_id ? userMap[lead.assigned_to_id]?.full_name || `#${lead.assigned_to_id}` : "Unassigned"}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(lead.next_follow_up)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showNew && <NewLeadModal onClose={() => setShowNew(false)} customers={customers} vehicles={vehicles} />}
    </div>
  );
}
