"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Customer } from "@/types";
import { initials, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", search],
    queryFn: async () => (await api.get(`/customers?search=${encodeURIComponent(search)}&limit=100`)).data,
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-sm)] border border-line bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading customers…</td></tr>
              )}
              {(customers || []).map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${c.id}`} className="flex items-center gap-2.5 group">
                      <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-[11px] font-medium shrink-0">
                        {initials(c.full_name)}
                      </div>
                      <span className="font-medium group-hover:text-accent transition-colors">{c.full_name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted tabular">{c.phone}</td>
                  <td className="px-5 py-3 text-muted">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-muted">{c.city ? `${c.city}, ${c.state}` : "—"}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
