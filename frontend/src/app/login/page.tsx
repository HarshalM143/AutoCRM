"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gauge } from "@/components/ui/gauge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Loader2, Lock, Mail, ChevronRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "admin@autocrm.in" },
  { role: "Branch Manager", email: "manager.chg@autocrm.in" },
  { role: "Sales Executive", email: "sales1@autocrm.in" },
  { role: "Service Advisor", email: "service1@autocrm.in" },
  { role: "Finance Executive", email: "finance1@autocrm.in" },
  { role: "Customer Support", email: "support1@autocrm.in" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [email, setEmail] = useState("admin@autocrm.in");
  const [password, setPassword] = useState("Demo@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setTokens(res.data.access_token, res.data.refresh_token);
      const me = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });
      setUser(me.data);
      router.push("/dashboard");
    } catch {
      setError("Incorrect email or password. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: instrument-cluster brand panel */}
      <div className="hidden lg:flex w-[46%] bg-ink relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, white 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, white 40px)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center font-display font-bold text-white">A</div>
          <span className="font-display text-lg font-semibold text-white tracking-tight">AutoCRM</span>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <Gauge value={87} label="Dealer Health Index" sublabel="Live across 3 branches" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-6 mt-10 text-center"
          >
            {[
              ["31", "Active Leads"],
              ["₹53.7L", "Pipeline Revenue"],
              ["12.9%", "Conversion Rate"],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-xl text-white font-semibold tabular">{val}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 text-white/40 text-sm max-w-sm leading-relaxed"
        >
          One dashboard from first inquiry to delivery and beyond — leads, inventory, service and finance, all in sync.
        </motion.p>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center font-display font-bold text-white text-sm">A</div>
            <span className="font-display text-base font-semibold">AutoCRM</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-text">Sign in to your dealership</h1>
          <p className="text-muted text-sm mt-1.5">Enter your credentials to access the console.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-sm)] border border-line bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  placeholder="you@dealership.in"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted">Password</label>
                <a href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-sm)] border border-line bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red bg-red-soft px-3 py-2 rounded-[var(--radius-sm)]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-xs font-medium text-muted mb-2.5">Quick demo access (password: Demo@123)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword("Demo@123"); }}
                  className="text-left text-xs px-2.5 py-2 rounded-[var(--radius-sm)] border border-line hover:border-accent hover:bg-accent-soft transition-colors text-muted hover:text-accent-dark"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
