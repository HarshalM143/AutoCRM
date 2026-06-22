"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { Vehicle } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Car, AlertTriangle, PackageCheck, PackageX, Package } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "ev", label: "EV" },
  { value: "commercial", label: "Commercial" },
];

export default function InventoryPage() {
  const [category, setCategory] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: async () => (await api.get("/vehicles/inventory-summary")).data,
  });

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["vehicles", category],
    queryFn: async () => (await api.get(`/vehicles${category ? `?category=${category}` : ""}`)).data,
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <PackageCheck className="w-4 h-4 text-teal mb-2" />
          <div className="font-display text-xl font-semibold tabular">{summary?.available_stock ?? "—"}</div>
          <div className="text-xs text-muted mt-0.5">Available Stock</div>
        </Card>
        <Card className="p-5">
          <Package className="w-4 h-4 text-amber mb-2" />
          <div className="font-display text-xl font-semibold tabular">{summary?.reserved_vehicles ?? "—"}</div>
          <div className="text-xs text-muted mt-0.5">Reserved Vehicles</div>
        </Card>
        <Card className="p-5">
          <PackageX className="w-4 h-4 text-muted mb-2" />
          <div className="font-display text-xl font-semibold tabular">{summary?.delivered_vehicles ?? "—"}</div>
          <div className="text-xs text-muted mt-0.5">Delivered Vehicles</div>
        </Card>
        <Card className="p-5">
          <AlertTriangle className="w-4 h-4 text-red mb-2" />
          <div className="font-display text-xl font-semibold tabular">{summary?.low_inventory_alerts?.length ?? "—"}</div>
          <div className="text-xs text-muted mt-0.5">Low Stock Alerts</div>
        </Card>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${category === c.value ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-accent hover:text-accent-dark"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-60 flex items-center justify-center text-muted text-sm">Loading inventory…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(vehicles || []).map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center">
                  <Car className="w-5 h-5 text-accent" />
                </div>
                <Badge variant={STATUS_VARIANT[v.status]}>{v.status.replace("_", " ")}</Badge>
              </div>
              <h3 className="font-display font-semibold text-sm">{v.model_name}</h3>
              <p className="text-xs text-muted mt-0.5">{v.variant} · {v.color} · {v.transmission}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                <div>
                  <div className="font-display font-semibold tabular text-sm">{formatCurrency(v.on_road_price || v.ex_showroom_price)}</div>
                  <div className="text-[10px] text-muted">on-road price</div>
                </div>
                <div className="text-right">
                  <div className={`font-display font-semibold tabular text-sm ${v.stock_quantity <= 3 ? "text-red" : ""}`}>{v.stock_quantity}</div>
                  <div className="text-[10px] text-muted">in stock</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
