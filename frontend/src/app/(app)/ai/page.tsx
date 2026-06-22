"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Sparkles, SendHorizonal, Bot, User, TrendingUp, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string; data?: object }

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AutoCRM AI assistant. I can help you with:\n• Show hot leads\n• Pending deliveries\n• Monthly sales report\n• Which customers are likely to buy?\n• Service due alerts",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [forecastData, setForecastData] = useState<{ predicted_units_next_month: number; predicted_revenue_next_month: number; confidence: string } | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  const [followUpChannel, setFollowUpChannel] = useState("email");
  const [followUpCustomer, setFollowUpCustomer] = useState("");
  const [followUpVehicle, setFollowUpVehicle] = useState("");
  const [followUpResult, setFollowUpResult] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setChatLoading(true);
    try {
      const res = await api.post("/ai/chat", { message: input });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply, data: res.data.data }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function getForecast() {
    setForecastLoading(true);
    try {
      const res = await api.get("/ai/sales-forecast");
      setForecastData(res.data);
    } finally {
      setForecastLoading(false);
    }
  }

  async function generateFollowUp() {
    setFollowUpLoading(true);
    try {
      const res = await api.post("/ai/follow-up-generator", {
        customer_name: followUpCustomer || "Valued Customer",
        vehicle_model: followUpVehicle || null,
        channel: followUpChannel,
      });
      setFollowUpResult(res.data.message);
    } finally {
      setFollowUpLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CRM Chat assistant */}
      <div className="lg:row-span-2">
        <Card className="flex flex-col h-[680px]">
          <CardHeader
            title="AI CRM Assistant"
            subtitle="Query your CRM with natural language"
            action={<Sparkles className="w-4 h-4 text-accent" />}
          />
          <div className="flex-1 overflow-y-auto scroll-thin px-5 py-2 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-[var(--radius-md)] px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-ink text-white rounded-tr-none" : "bg-paper border border-line rounded-tl-none"
                }`}>
                  {m.content}
                  {m.data && (
                    <div className="mt-2 text-[11px] text-muted bg-card border border-line rounded-[var(--radius-sm)] p-2 overflow-auto max-h-32">
                      <pre>{JSON.stringify(m.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-paper border border-line rounded-[var(--radius-md)] rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-muted-soft rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-line flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about hot leads, deliveries, monthly report…"
              className="flex-1 bg-paper border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <button onClick={sendMessage} disabled={chatLoading || !input.trim()}
              className="w-9 h-9 bg-ink rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-accent transition disabled:opacity-40">
              <SendHorizonal className="w-4 h-4 text-white" />
            </button>
          </div>
        </Card>
      </div>

      {/* Sales Forecast */}
      <Card>
        <CardHeader title="AI Sales Forecast" subtitle="Next-month prediction based on historical trends" />
        <div className="px-5 pb-5">
          {!forecastData ? (
            <button onClick={getForecast} disabled={forecastLoading}
              className="w-full flex items-center justify-center gap-2 border border-line rounded-[var(--radius-sm)] py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent-dark transition">
              <TrendingUp className="w-4 h-4" />
              {forecastLoading ? "Generating forecast…" : "Generate forecast"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-ink rounded-[var(--radius-md)] p-5 text-white">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Predicted units</div>
                <div className="font-display text-3xl font-semibold">{forecastData.predicted_units_next_month}</div>
                <div className="text-xs text-white/40 mt-3 mb-1">Predicted revenue</div>
                <div className="font-display text-xl font-semibold tabular">{formatCurrency(forecastData.predicted_revenue_next_month)}</div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted px-1">
                <span>Confidence: <span className="capitalize font-medium text-text">{forecastData.confidence}</span></span>
                <button onClick={() => setForecastData(null)} className="text-accent hover:underline">Refresh</button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Follow-up Generator */}
      <Card>
        <CardHeader title="AI Follow-up Generator" subtitle="Craft emails, WhatsApp messages, or call scripts" />
        <div className="px-5 pb-5 space-y-3">
          <div className="flex gap-1.5">
            {["email", "whatsapp", "call_script"].map((c) => (
              <button key={c} onClick={() => setFollowUpChannel(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${followUpChannel === c ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-accent"}`}>
                {c === "call_script" ? "Call Script" : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <input value={followUpCustomer} onChange={(e) => setFollowUpCustomer(e.target.value)}
            placeholder="Customer name"
            className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          <input value={followUpVehicle} onChange={(e) => setFollowUpVehicle(e.target.value)}
            placeholder="Vehicle model (optional)"
            className="w-full border border-line rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          <button onClick={generateFollowUp} disabled={followUpLoading}
            className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-[var(--radius-sm)] hover:bg-accent transition flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            {followUpLoading ? "Generating…" : "Generate message"}
          </button>
          {followUpResult && (
            <div className="bg-paper border border-line rounded-[var(--radius-sm)] p-4 text-sm whitespace-pre-wrap text-text">
              {followUpResult}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
