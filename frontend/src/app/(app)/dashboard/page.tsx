"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Gauge } from "@/components/ui/gauge";
import { formatCurrency } from "@/lib/utils";
import {
  Users, UserPlus, Flame, Car, IndianRupee, TrendingUp, Wrench, Clock,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface DashboardData {
  kpis: {
    total_customers: number; total_leads: number; hot_leads: number; vehicles_sold: number;
    revenue: number; monthly_sales: number; service_revenue: number; pending_follow_ups: number;
  };
  sales_trend: { label: string; value: number }[];
  revenue_trend: { label: string; value: number }[];
  lead_conversion_rate: number;
  vehicle_distribution: { label: string; value: number }[];
  branch_performance: { branch_name: string; sales: number; revenue: number }[];
}

const PIE_COLORS = ["#FF5A1F", "#0EA894", "#3E6AE1", "#F2A93B", "#94A3B8"];

function KpiCard({ icon: Icon, label, value, hint, accent }: { icon: any; label: string; value: string; hint?: string; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center" style={{ background: `${accent}1A` }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
        </div>
      </div>
      <div className="font-display text-2xl font-semibold tabular text-text">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      {hint && <div className="text-[11px] text-teal mt-1.5">{hint}</div>}
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });
  const { data: widgets } = useQuery({
    queryKey: ["dashboard-widgets"],
    queryFn: async () => (await api.get("/dashboard/widgets")).data,
  });

  if (isLoading || !data) {
    return <div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-card border border-line rounded-[var(--radius-md)] animate-pulse" />)}</div>;
  }

  const k = data.kpis;

  return (
    <div className="space-y-6 pb-10">
      {/* Hero row: gauges for the two headline metrics + KPI grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <Card className="bg-ink p-6 flex flex-col items-center justify-center">
          <Gauge value={data.lead_conversion_rate} max={100} label="Conversion Rate" sublabel="Lead → Delivered" size={170} />
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Total Customers" value={k.total_customers.toLocaleString()} accent="#3E6AE1" />
          <KpiCard icon={UserPlus} label="Total Leads" value={k.total_leads.toLocaleString()} accent="#FF5A1F" />
          <KpiCard icon={Flame} label="Hot Leads" value={k.hot_leads.toLocaleString()} hint="Score 70+" accent="#F2A93B" />
          <KpiCard icon={Car} label="Vehicles Sold" value={k.vehicles_sold.toLocaleString()} accent="#0EA894" />
          <KpiCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(k.revenue)} accent="#FF5A1F" />
          <KpiCard icon={TrendingUp} label="Monthly Sales" value={k.monthly_sales.toLocaleString()} accent="#0EA894" />
          <KpiCard icon={Wrench} label="Service Revenue" value={formatCurrency(k.service_revenue)} accent="#3E6AE1" />
          <KpiCard icon={Clock} label="Pending Follow-ups" value={k.pending_follow_ups.toLocaleString()} accent="#E0464C" />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Sales & Revenue Trend" subtitle="Last 6 months" />
          <div className="px-3 pb-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FF5A1F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EB" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} width={60} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 10, border: "1px solid #E3E6EB", fontSize: 12 }} />
                <Area type="monotone" dataKey="value" name="Revenue" stroke="#FF5A1F" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Vehicle Sales Distribution" subtitle="By category" />
          <div className="px-3 pb-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.vehicle_distribution} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {data.vehicle_distribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E3E6EB", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Sales Volume" subtitle="Units booked per month" />
          <div className="px-3 pb-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EB" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E3E6EB", fontSize: 12 }} />
                <Bar dataKey="value" name="Units Sold" fill="#0EA894" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Branch Performance" />
          <div className="px-5 pb-5 space-y-3">
            {data.branch_performance.map((b) => (
              <div key={b.branch_name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-text">{b.branch_name}</span>
                  <span className="text-muted tabular">{formatCurrency(b.revenue)}</span>
                </div>
                <div className="h-1.5 bg-paper rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.min((b.revenue / Math.max(...data.branch_performance.map(p => p.revenue), 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Widgets row */}
      {widgets && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted mb-1">Today's Appointments</div>
            <div className="font-display text-2xl font-semibold tabular">{widgets.todays_appointments}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted mb-1">Upcoming Deliveries</div>
            <div className="font-display text-2xl font-semibold tabular">{widgets.upcoming_deliveries}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted mb-1">Service Due Alerts</div>
            <div className="font-display text-2xl font-semibold tabular">{widgets.service_due_alerts}</div>
          </Card>
        </div>
      )}
    </div>
  );
}
