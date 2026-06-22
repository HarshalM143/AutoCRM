"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

interface Quotation {
  id: number; lead_id: number; vehicle_id: number; ex_showroom_price: number;
  accessories_cost: number; tax_amount: number; discount: number; on_road_price: number;
  emi_tenure_months?: string; emi_amount?: number; quote_number: string; status: string;
}

const STATUS_COLOR: Record<string, "default" | "blue" | "teal" | "red"> = {
  draft: "default", sent: "blue", accepted: "teal", rejected: "red",
};

export default function QuotationsPage() {
  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["quotations"], queryFn: async () => (await api.get("/quotations")).data,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {isLoading && <p className="text-muted text-sm">Loading quotations…</p>}
      {(quotations || []).map((q) => (
        <Card key={q.id} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="font-display font-semibold text-sm tabular">{q.quote_number}</span>
            </div>
            <Badge variant={STATUS_COLOR[q.status] || "default"}>{q.status}</Badge>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Ex-showroom price</span><span className="tabular">{formatCurrency(q.ex_showroom_price)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Accessories</span><span className="tabular">{formatCurrency(q.accessories_cost)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span className="tabular">{formatCurrency(q.tax_amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Discount</span><span className="tabular text-teal">-{formatCurrency(q.discount)}</span></div>
            <div className="flex justify-between pt-2 border-t border-line font-semibold"><span>On-road price</span><span className="tabular">{formatCurrency(q.on_road_price)}</span></div>
            {q.emi_amount && (
              <div className="flex justify-between text-xs text-muted pt-1">
                <span>EMI ({q.emi_tenure_months} months)</span><span className="tabular">{formatCurrency(q.emi_amount)}/mo</span>
              </div>
            )}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-1.5 border border-line rounded-[var(--radius-sm)] py-2 text-xs font-medium text-muted hover:border-accent hover:text-accent-dark transition">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </Card>
      ))}
    </div>
  );
}
