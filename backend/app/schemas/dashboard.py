from pydantic import BaseModel
from typing import List, Optional


class KPISummary(BaseModel):
    total_customers: int
    total_leads: int
    hot_leads: int
    vehicles_sold: int
    revenue: float
    monthly_sales: int
    service_revenue: float
    pending_follow_ups: int


class TrendPoint(BaseModel):
    label: str
    value: float


class BranchPerformance(BaseModel):
    branch_name: str
    sales: int
    revenue: float


class DashboardResponse(BaseModel):
    kpis: KPISummary
    sales_trend: List[TrendPoint]
    revenue_trend: List[TrendPoint]
    lead_conversion_rate: float
    vehicle_distribution: List[TrendPoint]
    branch_performance: List[BranchPerformance]
