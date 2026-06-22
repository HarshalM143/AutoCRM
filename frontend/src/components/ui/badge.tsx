import { cn } from "@/lib/utils";

const VARIANTS: Record<string, string> = {
  default: "bg-paper text-muted border-line",
  accent: "bg-accent-soft text-accent-dark border-transparent",
  teal: "bg-teal-soft text-teal border-transparent",
  amber: "bg-amber-soft text-[#92660F] border-transparent",
  red: "bg-red-soft text-red border-transparent",
  blue: "bg-blue-soft text-blue border-transparent",
};

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: keyof typeof VARIANTS; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}

export const STATUS_VARIANT: Record<string, keyof typeof VARIANTS> = {
  new: "blue", contacted: "blue", qualified: "teal", test_drive_scheduled: "amber",
  negotiation: "amber", booking: "accent", delivered: "teal", closed: "default", lost: "red",
  available: "teal", reserved: "amber", sold: "default", in_transit: "blue", service: "amber",
  scheduled: "blue", confirmed: "teal", completed: "teal", cancelled: "red",
  booked: "blue", payment_pending: "amber", payment_done: "teal", documentation: "blue",
  registration: "blue", open: "red", in_progress: "amber", escalated: "red", resolved: "teal",
  applied: "blue", under_review: "amber", approved: "teal", rejected: "red", disbursed: "teal",
  active: "teal", expired: "red", renewal_due: "amber", claim_in_progress: "amber",
  inspection: "amber", low: "default", medium: "blue", high: "amber", critical: "red",
};
