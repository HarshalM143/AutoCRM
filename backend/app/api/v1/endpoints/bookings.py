import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.booking import Booking
from app.models.vehicle import Vehicle
from app.models.enums import VehicleStatus
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[BookingOut])
def list_bookings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Booking).order_by(Booking.id.desc()).all()


@router.post("", response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    booking = Booking(**payload.model_dump(), booking_number=f"BK-{random.randint(100000, 999999)}")
    vehicle = db.query(Vehicle).get(payload.vehicle_id)
    if vehicle:
        vehicle.status = VehicleStatus.RESERVED
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(booking_id: int, payload: BookingUpdate, db: Session = Depends(get_db),
                    _=Depends(get_current_user)):
    booking = db.query(Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(booking, k, v)
    if payload.status and payload.status.value == "delivered":
        vehicle = db.query(Vehicle).get(booking.vehicle_id)
        if vehicle:
            vehicle.status = VehicleStatus.SOLD
    db.commit()
    db.refresh(booking)
    return booking
