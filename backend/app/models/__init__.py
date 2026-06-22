from app.db.base_class import Base  # noqa
from app.models.user import User, Branch  # noqa
from app.models.customer import Customer  # noqa
from app.models.vehicle import Vehicle  # noqa
from app.models.lead import Lead, LeadActivity  # noqa
from app.models.testdrive import TestDrive  # noqa
from app.models.quotation import Quotation  # noqa
from app.models.booking import Booking  # noqa
from app.models.finance import LoanApplication, InsurancePolicy  # noqa
from app.models.service import ServiceJob, SparePart, PurchaseOrder  # noqa
from app.models.support import Ticket  # noqa
from app.models.document import Document  # noqa
from app.models.communication import CommunicationLog, MessageTemplate, Notification  # noqa
from app.models.audit import AuditLog  # noqa
