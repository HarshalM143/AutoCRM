"""Seed script — populates demo data across every module for portfolio/demo purposes."""
import random
from datetime import datetime, timedelta
from decimal import Decimal

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Branch
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.lead import Lead, LeadActivity
from app.models.testdrive import TestDrive
from app.models.quotation import Quotation
from app.models.booking import Booking
from app.models.finance import LoanApplication, InsurancePolicy
from app.models.service import ServiceJob, SparePart
from app.models.support import Ticket
from app.models.communication import CommunicationLog, Notification, MessageTemplate
from app.models.enums import (
    UserRole, LeadStatus, LeadSource, VehicleCategory, VehicleStatus,
    TestDriveStatus, BookingStatus, LoanStatus, InsuranceStatus, ServiceStatus,
    TicketStatus, TicketPriority, CommunicationChannel
)

db = SessionLocal()

FIRST_NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Neha", "Karan", "Pooja",
               "Suresh", "Divya", "Arjun", "Kavita", "Manoj", "Ritu", "Sandeep", "Meera", "Vivek", "Shreya"]
LAST_NAMES = ["Sharma", "Patil", "Deshmukh", "Iyer", "Nair", "Joshi", "Kulkarni", "Reddy", "Gupta", "Verma"]
CITIES = [("Chalisgaon", "Maharashtra"), ("Jalgaon", "Maharashtra"), ("Pune", "Maharashtra"),
          ("Nashik", "Maharashtra"), ("Aurangabad", "Maharashtra")]


def rand_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def rand_phone():
    return f"9{random.randint(100000000, 999999999)}"


def run():
    print("Seeding branches...")
    branches = [
        Branch(name="Tata Motors - Chalisgaon", code="CHG01", address="MIDC Road",
               city="Chalisgaon", state="Maharashtra", pincode="424101",
               phone="9876500001", email="chalisgaon@autocrm.in"),
        Branch(name="Tata Motors - Jalgaon", code="JLG01", address="Ring Road",
               city="Jalgaon", state="Maharashtra", pincode="425001",
               phone="9876500002", email="jalgaon@autocrm.in"),
        Branch(name="Tata Motors - Pune", code="PUN01", address="Hinjewadi Phase 2",
               city="Pune", state="Maharashtra", pincode="411057",
               phone="9876500003", email="pune@autocrm.in"),
    ]
    db.add_all(branches)
    db.commit()
    for b in branches:
        db.refresh(b)

    print("Seeding users (all roles, demo credentials)...")
    demo_password = get_password_hash("Demo@123")
    users_data = [
        ("Super Admin", "admin@autocrm.in", UserRole.SUPER_ADMIN, None),
        ("Ananya Mehta", "manager.chg@autocrm.in", UserRole.BRANCH_MANAGER, branches[0].id),
        ("Rajesh Kumar", "manager.jlg@autocrm.in", UserRole.BRANCH_MANAGER, branches[1].id),
        ("Sales Exec - Aditya", "sales1@autocrm.in", UserRole.SALES_EXECUTIVE, branches[0].id),
        ("Sales Exec - Komal", "sales2@autocrm.in", UserRole.SALES_EXECUTIVE, branches[0].id),
        ("Sales Exec - Yash", "sales3@autocrm.in", UserRole.SALES_EXECUTIVE, branches[1].id),
        ("Service Advisor - Imran", "service1@autocrm.in", UserRole.SERVICE_ADVISOR, branches[0].id),
        ("Finance Exec - Geeta", "finance1@autocrm.in", UserRole.FINANCE_EXECUTIVE, branches[0].id),
        ("Support - Faisal", "support1@autocrm.in", UserRole.CUSTOMER_SUPPORT, branches[0].id),
    ]
    users = []
    for name, email, role, branch_id in users_data:
        u = User(full_name=name, email=email, phone=rand_phone(),
                 hashed_password=demo_password, role=role, branch_id=branch_id, is_active=True)
        users.append(u)
    db.add_all(users)
    db.commit()
    for u in users:
        db.refresh(u)

    sales_execs = [u for u in users if u.role == UserRole.SALES_EXECUTIVE]
    service_advisors = [u for u in users if u.role == UserRole.SERVICE_ADVISOR]
    finance_execs = [u for u in users if u.role == UserRole.FINANCE_EXECUTIVE]
    support_agents = [u for u in users if u.role == UserRole.CUSTOMER_SUPPORT]

    print("Seeding vehicles...")
    vehicle_catalog = [
        ("Tata Tiago", "XZ+", VehicleCategory.HATCHBACK, "Petrol", 650000),
        ("Tata Altroz", "XM", VehicleCategory.HATCHBACK, "Diesel", 850000),
        ("Tata Tigor", "XZ", VehicleCategory.SEDAN, "Petrol", 750000),
        ("Tata Nexon", "Fearless+", VehicleCategory.SUV, "Petrol", 1250000),
        ("Tata Harrier", "Adventure", VehicleCategory.SUV, "Diesel", 2150000),
        ("Tata Safari", "Accomplished", VehicleCategory.SUV, "Diesel", 2450000),
        ("Tata Nexon EV", "Max XZ+", VehicleCategory.EV, "Electric", 1700000),
        ("Tata Tiago EV", "XZ+", VehicleCategory.EV, "Electric", 1100000),
        ("Tata Ace", "Gold", VehicleCategory.COMMERCIAL, "Diesel", 650000),
        ("Tata Intra", "V30", VehicleCategory.COMMERCIAL, "Diesel", 900000),
    ]
    vehicles = []
    colors = ["Pearl White", "Daytona Grey", "Flame Red", "Tropical Mist", "Atomic Orange"]
    for model, variant, category, fuel, price in vehicle_catalog:
        for _ in range(random.randint(2, 3)):
            v = Vehicle(
                model_name=model, variant=variant, category=category, fuel_type=fuel,
                transmission=random.choice(["Manual", "Automatic"]), color=random.choice(colors),
                vin=f"VIN{random.randint(100000000, 999999999)}",
                ex_showroom_price=Decimal(price), on_road_price=Decimal(price * 1.12),
                status=random.choice([VehicleStatus.AVAILABLE, VehicleStatus.AVAILABLE, VehicleStatus.RESERVED]),
                stock_quantity=random.randint(1, 8), low_stock_threshold=3,
                branch_id=random.choice(branches).id,
                specifications='{"engine": "1.2L Revotron", "mileage": "20 kmpl", "seating": 5}',
            )
            vehicles.append(v)
    db.add_all(vehicles)
    db.commit()
    for v in vehicles:
        db.refresh(v)

    print("Seeding customers...")
    customers = []
    for _ in range(40):
        city, state = random.choice(CITIES)
        c = Customer(
            full_name=rand_name(), email=f"customer{random.randint(1000,9999)}@mail.com",
            phone=rand_phone(), city=city, state=state, pincode="42410" + str(random.randint(0, 9)),
            occupation=random.choice(["Business", "Salaried", "Farmer", "Self-Employed"]),
        )
        customers.append(c)
    db.add_all(customers)
    db.commit()
    for c in customers:
        db.refresh(c)

    print("Seeding leads + activities...")
    statuses = list(LeadStatus)
    sources = list(LeadSource)
    leads = []
    for c in customers:
        if random.random() < 0.8:
            status = random.choice(statuses)
            lead = Lead(
                customer_id=c.id, branch_id=random.choice(branches).id,
                assigned_to_id=random.choice(sales_execs).id,
                interested_vehicle_id=random.choice(vehicles).id,
                status=status, source=random.choice(sources),
                score=random.randint(20, 95), purchase_probability=random.randint(10, 90),
                next_follow_up=datetime.utcnow() + timedelta(days=random.randint(-2, 10)),
                notes="Initial inquiry via " + random.choice(["showroom visit", "phone call", "website form"]),
            )
            leads.append(lead)
    db.add_all(leads)
    db.commit()
    for l in leads:
        db.refresh(l)
        db.add(LeadActivity(lead_id=l.id, user_id=l.assigned_to_id, activity_type="note",
                             description="Lead created and assigned"))
    db.commit()

    print("Seeding test drives...")
    test_drives = []
    for l in random.sample(leads, min(20, len(leads))):
        td = TestDrive(
            customer_id=l.customer_id, vehicle_id=l.interested_vehicle_id, lead_id=l.id,
            assigned_executive_id=l.assigned_to_id,
            scheduled_at=datetime.utcnow() + timedelta(days=random.randint(-5, 10)),
            route="Showroom to Highway Loop",
            status=random.choice(list(TestDriveStatus)),
        )
        test_drives.append(td)
    db.add_all(test_drives)
    db.commit()

    print("Seeding quotations...")
    quotations = []
    for l in random.sample(leads, min(15, len(leads))):
        vehicle = db.query(Vehicle).get(l.interested_vehicle_id)
        ex_price = vehicle.ex_showroom_price
        tax = ex_price * Decimal("0.15")
        discount = Decimal(random.choice([0, 10000, 20000]))
        on_road = ex_price + tax - discount
        q = Quotation(
            lead_id=l.id, vehicle_id=vehicle.id, ex_showroom_price=ex_price,
            accessories_cost=Decimal(5000), tax_amount=tax, discount=discount,
            on_road_price=on_road, emi_tenure_months="60", emi_amount=on_road / 60,
            quote_number=f"QT-{random.randint(100000,999999)}", status=random.choice(["draft", "sent", "accepted"]),
        )
        quotations.append(q)
    db.add_all(quotations)
    db.commit()

    print("Seeding bookings...")
    bookings = []
    booking_leads = [l for l in leads if l.status in (LeadStatus.BOOKING, LeadStatus.DELIVERED)]
    for l in booking_leads:
        vehicle = db.query(Vehicle).get(l.interested_vehicle_id)
        total = vehicle.on_road_price
        b = Booking(
            customer_id=l.customer_id, vehicle_id=vehicle.id, lead_id=l.id,
            sales_executive_id=l.assigned_to_id,
            booking_number=f"BK-{random.randint(100000,999999)}",
            booking_amount=Decimal(25000), total_amount=total,
            amount_paid=total if l.status == LeadStatus.DELIVERED else Decimal(25000),
            status=BookingStatus.DELIVERED if l.status == LeadStatus.DELIVERED else BookingStatus.BOOKED,
            delivery_scheduled_at=datetime.utcnow() + timedelta(days=random.randint(1, 20)),
            delivery_completed_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)) if l.status == LeadStatus.DELIVERED else None,
        )
        bookings.append(b)
        if l.status == LeadStatus.DELIVERED:
            vehicle.status = VehicleStatus.SOLD
    db.add_all(bookings)
    db.commit()
    for b in bookings:
        db.refresh(b)

    print("Seeding loans + insurance...")
    banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Tata Capital"]
    for b in bookings:
        if random.random() < 0.6:
            loan = LoanApplication(
                customer_id=b.customer_id, booking_id=b.id,
                finance_executive_id=random.choice(finance_execs).id if finance_execs else None,
                bank_name=random.choice(banks), loan_amount=b.total_amount * Decimal("0.8"),
                interest_rate=Decimal(random.choice([8.5, 9.0, 9.5, 10.0])),
                tenure_months=random.choice([36, 48, 60]),
                emi_amount=b.total_amount * Decimal("0.8") / 48,
                status=random.choice(list(LoanStatus)), applied_at=datetime.utcnow() - timedelta(days=10),
            )
            db.add(loan)
        if random.random() < 0.5:
            policy = InsurancePolicy(
                customer_id=b.customer_id, vehicle_id=b.vehicle_id,
                insurer_name=random.choice(["ICICI Lombard", "Bajaj Allianz", "HDFC Ergo"]),
                policy_number=f"POL{random.randint(100000,999999)}",
                policy_type=random.choice(["comprehensive", "third_party"]),
                premium_amount=Decimal(random.randint(8000, 25000)),
                coverage_amount=b.total_amount,
                start_date=datetime.utcnow() - timedelta(days=30),
                end_date=datetime.utcnow() + timedelta(days=335),
                status=random.choice(list(InsuranceStatus)),
            )
            db.add(policy)
    db.commit()

    print("Seeding service jobs + spare parts...")
    service_types = ["Periodic Service", "General Repair", "Accident Repair", "Recall Campaign"]
    for c in random.sample(customers, min(20, len(customers))):
        owned_booking = next((b for b in bookings if b.customer_id == c.id), None)
        job = ServiceJob(
            customer_id=c.id, vehicle_id=owned_booking.vehicle_id if owned_booking else random.choice(vehicles).id,
            service_advisor_id=random.choice(service_advisors).id if service_advisors else None,
            job_card_number=f"JC-{random.randint(100000,999999)}",
            service_type=random.choice(service_types),
            description="Routine check and maintenance",
            scheduled_at=datetime.utcnow() - timedelta(days=random.randint(0, 200)),
            status=random.choice(list(ServiceStatus)),
            estimated_cost=Decimal(random.randint(2000, 15000)),
            final_cost=Decimal(random.randint(2000, 15000)),
            odometer_reading=random.randint(5000, 60000),
        )
        db.add(job)
    db.commit()

    parts_catalog = [
        ("Brake Pad Set", "BP-1001", "Brakes", 1500, 45),
        ("Oil Filter", "OF-2002", "Engine", 250, 120),
        ("Air Filter", "AF-3003", "Engine", 400, 80),
        ("Headlight Assembly", "HL-4004", "Electrical", 4500, 12),
        ("Clutch Plate", "CP-5005", "Transmission", 3200, 8),
        ("Wiper Blade", "WB-6006", "Exterior", 350, 200),
        ("Battery 12V", "BT-7007", "Electrical", 6500, 15),
    ]
    for name, pn, cat, price, qty in parts_catalog:
        db.add(SparePart(name=name, part_number=pn, category=cat, vendor="Tata OEM Parts",
                          unit_price=Decimal(price), stock_quantity=qty, low_stock_threshold=15,
                          warehouse_location="Rack-" + str(random.randint(1, 20))))
    db.commit()

    print("Seeding support tickets...")
    categories = ["service", "sales", "billing", "general"]
    for c in random.sample(customers, min(15, len(customers))):
        t = Ticket(
            customer_id=c.id, assigned_to_id=random.choice(support_agents).id if support_agents else None,
            ticket_number=f"TKT-{random.randint(100000,999999)}",
            subject=random.choice(["Delayed delivery", "Service quality issue", "Billing discrepancy",
                                    "Test drive feedback", "EMI query"]),
            description="Customer raised a concern requiring follow-up.",
            category=random.choice(categories), priority=random.choice(list(TicketPriority)),
            status=random.choice(list(TicketStatus)),
            sla_due_at=datetime.utcnow() + timedelta(hours=24),
        )
        db.add(t)
    db.commit()

    print("Seeding communication logs + templates + notifications...")
    for c in random.sample(customers, min(20, len(customers))):
        db.add(CommunicationLog(
            customer_id=c.id, channel=random.choice(list(CommunicationChannel)),
            direction=random.choice(["inbound", "outbound"]),
            subject="Follow-up regarding your inquiry",
            message="Thank you for visiting our showroom. Let us know if you have questions.",
        ))
    templates = [
        ("Test Drive Reminder", CommunicationChannel.SMS, None, "Hi {name}, your test drive is confirmed for {date}.", "follow_up"),
        ("Service Due Reminder", CommunicationChannel.WHATSAPP, None, "Hi {name}, your vehicle is due for service. Book now!", "service_reminder"),
        ("Festive Offer", CommunicationChannel.EMAIL, "Special Festive Offers Inside!", "Dear {name}, enjoy special discounts this festive season.", "promo"),
    ]
    for name, channel, subject, body, category in templates:
        db.add(MessageTemplate(name=name, channel=channel, subject=subject, body=body, category=category))
    for u in sales_execs + service_advisors:
        db.add(Notification(user_id=u.id, title="New lead assigned", message="You have a new lead to follow up on.",
                             notif_type="follow_up", is_read=False))
    db.commit()

    print("\n✅ Seed complete!")
    print(f"Branches: {len(branches)} | Users: {len(users)} | Vehicles: {len(vehicles)} | Customers: {len(customers)}")
    print(f"Leads: {len(leads)} | Test Drives: {len(test_drives)} | Quotations: {len(quotations)} | Bookings: {len(bookings)}")
    print("\nDemo login (all roles use password: Demo@123):")
    for name, email, role, _ in users_data:
        print(f"  {role.value:20s} -> {email}")


if __name__ == "__main__":
    run()
