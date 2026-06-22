"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, STATUS_VARIANT } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Landmark, ShieldCheck, Calculator } from "lucide-react";

interface Loan {
  id: number; customer_id: number; bank_name: string; loan_amount: number;
  interest_rate?: number; tenure_months?: number; emi_amount?: number; status: string;
}
interface InsurancePolicy {
  id: number; customer_id: number; insurer_name: string; policy_number: string;
  policy_type: string; premium_amount: number; coverage_amount: number;
  start_date: string; end_date: string; status: string;
}

export default function FinancePage() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("9.5");
  const [tenure, setTenure] = useState("60");
  const [emiResult, setEmiResult] = useState<{ emi: number; total_payment: number; total_interest: number } | null>(null);

  const { data: loans } = useQuery<Loan[]>({ queryKey: ["loans"], queryFn: async () => (await api.get("/finance/loans")).data });
  const { data: insurance } = useQuery<InsurancePolicy[]>({ queryKey: ["insurance"], queryFn: async () => (await api.get("/finance/insurance")).data });

  async function calculateEMI() {
    const res = await api.post("/finance/emi-calculator", { principal: Number(principal), annual_rate: Number(rate), tenure_months: Number(tenure) });
    setEmiResult(res.data);
  }

  return (
    <div className="space-y-6">
      {/* EMI Calculator */}
      <Card>
        <CardHeader title="EMI Calculator" subtitle="Compute equated monthly instalments for any loan configuration" />
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { label: "Principal Amount (₹)", val: principal, set: setPrincipal, ph: "1000000" },
              { label: "Annual Interest Rate (%)", val: rate, set: setRate, ph: "9.5" },
              { label: "Tenure (months)", val: tenure, set: setTenure, ph: "60" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="text-xs text-muted mb-1.5 block">{label}</label>
                <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} type="number"
                  className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition" />
              </div>
            ))}
            <button onClick={calculateEMI}
              className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4" /> Calculate EMI
            </button>
          </div>
          {emiResult && (
            <div className="bg-ink rounded-[var(--radius-md)] p-6 text-white flex flex-col justify-center gap-4">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Monthly EMI</div>
                <div className="font-display text-4xl font-semibold tabular">{formatCurrency(emiResult.emi)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-xs text-white/40 mb-1">Total Payment</div>
                  <div className="font-display font-semibold tabular">{formatCurrency(emiResult.total_payment)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Total Interest</div>
                  <div className="font-display font-semibold tabular text-accent">{formatCurrency(emiResult.total_interest)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Loans */}
      <Card>
        <CardHeader title="Loan Applications" subtitle={`${(loans || []).length} applications on record`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Bank</th>
                <th className="px-5 py-3 font-medium">Loan Amount</th>
                <th className="px-5 py-3 font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">EMI</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(loans || []).map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-accent" />Customer #{l.customer_id}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{l.bank_name}</td>
                  <td className="px-5 py-3 tabular font-medium">{formatCurrency(l.loan_amount)}</td>
                  <td className="px-5 py-3 text-muted tabular">{l.interest_rate ? `${l.interest_rate}%` : "—"}</td>
                  <td className="px-5 py-3 tabular">{l.emi_amount ? formatCurrency(l.emi_amount) : "—"}</td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[l.status]}>{l.status.replace("_", " ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insurance */}
      <Card>
        <CardHeader title="Insurance Policies" subtitle={`${(insurance || []).length} active and pending policies`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 pb-5">
          {(insurance || []).map((p) => (
            <div key={p.id} className="border border-line rounded-[var(--radius-sm)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  <span className="font-medium text-sm">{p.insurer_name}</span>
                </div>
                <Badge variant={STATUS_VARIANT[p.status]}>{p.status.replace("_", " ")}</Badge>
              </div>
              <div className="text-xs text-muted space-y-1">
                <div className="flex justify-between"><span>Policy #</span><span className="tabular">{p.policy_number}</span></div>
                <div className="flex justify-between"><span>Type</span><span className="capitalize">{p.policy_type.replace("_", " ")}</span></div>
                <div className="flex justify-between"><span>Premium</span><span className="tabular">{formatCurrency(p.premium_amount)}/yr</span></div>
                <div className="flex justify-between"><span>Coverage</span><span className="tabular">{formatCurrency(p.coverage_amount)}</span></div>
                <div className="flex justify-between"><span>Valid till</span><span>{formatDate(p.end_date)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
