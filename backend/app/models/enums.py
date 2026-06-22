import enum


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    BRANCH_MANAGER = "branch_manager"
    SALES_EXECUTIVE = "sales_executive"
    SERVICE_ADVISOR = "service_advisor"
    FINANCE_EXECUTIVE = "finance_executive"
    CUSTOMER_SUPPORT = "customer_support"


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    TEST_DRIVE_SCHEDULED = "test_drive_scheduled"
    NEGOTIATION = "negotiation"
    BOOKING = "booking"
    DELIVERED = "delivered"
    CLOSED = "closed"
    LOST = "lost"


class LeadSource(str, enum.Enum):
    WEBSITE = "website"
    WALK_IN = "walk_in"
    REFERRAL = "referral"
    SOCIAL_MEDIA = "social_media"
    CALL_CENTER = "call_center"
    EVENT = "event"
    PARTNER = "partner"


class VehicleCategory(str, enum.Enum):
    HATCHBACK = "hatchback"
    SEDAN = "sedan"
    SUV = "suv"
    EV = "ev"
    COMMERCIAL = "commercial"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"
    IN_TRANSIT = "in_transit"
    SERVICE = "service"


class TestDriveStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingStatus(str, enum.Enum):
    BOOKED = "booked"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_DONE = "payment_done"
    DOCUMENTATION = "documentation"
    REGISTRATION = "registration"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class LoanStatus(str, enum.Enum):
    APPLIED = "applied"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"


class InsuranceStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    RENEWAL_DUE = "renewal_due"
    CLAIM_IN_PROGRESS = "claim_in_progress"


class ServiceStatus(str, enum.Enum):
    BOOKED = "booked"
    INSPECTION = "inspection"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELIVERED = "delivered"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DocumentType(str, enum.Enum):
    AADHAAR = "aadhaar"
    PAN = "pan"
    RC_BOOK = "rc_book"
    INSURANCE = "insurance"
    LOAN = "loan"
    DELIVERY_NOTE = "delivery_note"
    OTHER = "other"


class CommunicationChannel(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    CALL = "call"
    IN_APP = "in_app"
