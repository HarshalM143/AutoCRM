from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.communication import Notification
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(
        Notification.id.desc()).limit(50).all()
    return [{"id": n.id, "title": n.title, "message": n.message, "notif_type": n.notif_type,
             "is_read": n.is_read, "created_at": n.created_at} for n in notifs]


@router.put("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    n = db.query(Notification).get(notif_id)
    if n:
        n.is_read = True
        db.commit()
    return {"message": "marked read"}
