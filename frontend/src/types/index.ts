export interface Customer {
  id: number; full_name: string; email?: string | null; phone: string;
  city?: string | null; state?: string | null; created_at: string;
}

export interface Vehicle {
  id: number; model_name: string; variant?: string | null; category: string;
  fuel_type?: string | null; transmission?: string | null; color?: string | null;
  ex_showroom_price: number; on_road_price?: number | null; status: string;
  stock_quantity: number; branch_id?: number | null;
}

export interface Lead {
  id: number; customer_id: number; branch_id?: number | null; assigned_to_id?: number | null;
  interested_vehicle_id?: number | null; status: string; source: string; score: number;
  purchase_probability: number; next_follow_up?: string | null; notes?: string | null; created_at: string;
}

export interface UserLite {
  id: number; full_name: string; email: string; role: string;
}

export const LEAD_STATUSES = [
  "new", "contacted", "qualified", "test_drive_scheduled", "negotiation", "booking", "delivered", "closed", "lost",
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  test_drive_scheduled: "Test Drive Scheduled", negotiation: "Negotiation",
  booking: "Booking", delivered: "Delivered", closed: "Closed", lost: "Lost",
};
