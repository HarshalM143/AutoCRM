"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Mail, ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.post("/auth/forgot-password", { email });
    if (res.data.demo_otp) setOtp(res.data.demo_otp);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <Link href="/login" className="flex items-center gap-1 text-sm text-muted hover:text-accent mb-8">
          <ChevronLeft className="w-4 h-4" /> Back to sign in
        </Link>
        <h1 className="font-display text-2xl font-semibold mb-1">Reset your password</h1>
        <p className="text-sm text-muted mb-8">Enter your work email to receive a one-time code.</p>

        {!sent ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dealership.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-sm)] border border-line bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <button type="submit" className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition">
              Send reset code
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="bg-teal-soft border border-teal rounded-[var(--radius-sm)] px-4 py-3 text-sm text-teal">
              ✓ OTP sent. {otp && <span className="font-medium">Demo OTP: <code className="bg-card px-1.5 py-0.5 rounded">{otp}</code></span>}
            </div>
            <Link href="/login" className="block text-center text-sm text-accent hover:underline">Return to sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
