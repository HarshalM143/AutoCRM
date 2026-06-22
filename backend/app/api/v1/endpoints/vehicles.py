from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.models.enums import VehicleCategory, VehicleStatus
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[VehicleOut])
def list_vehicles(category: Optional[VehicleCategory] = None, status: Optional[VehicleStatus] = None,
                   branch_id: Optional[int] = None, skip: int = 0, limit: int = 100,
                   db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Vehicle)
    if category:
        q = q.filter(Vehicle.category == category)
    if status:
        q = q.filter(Vehicle.status == status)
    if branch_id:
        q = q.filter(Vehicle.branch_id == branch_id)
    return q.order_by(Vehicle.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=VehicleOut)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/inventory-summary")
def inventory_summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicles = db.query(Vehicle).all()
    available = sum(v.stock_quantity for v in vehicles if v.status == VehicleStatus.AVAILABLE)
    reserved = sum(1 for v in vehicles if v.status == VehicleStatus.RESERVED)
    sold = sum(1 for v in vehicles if v.status == VehicleStatus.SOLD)
    low_stock = [{"id": v.id, "model_name": v.model_name, "stock_quantity": v.stock_quantity}
                 for v in vehicles if v.stock_quantity <= v.low_stock_threshold]
    return {
        "available_stock": available,
        "reserved_vehicles": reserved,
        "delivered_vehicles": sold,
        "low_inventory_alerts": low_stock,
    }


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicle = db.query(Vehicle).get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db),
                    _=Depends(get_current_user)):
    vehicle = db.query(Vehicle).get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, k, v)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicle = db.query(Vehicle).get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted"}
