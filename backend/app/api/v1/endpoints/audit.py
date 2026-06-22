from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audit import AuditLog
from app.api.deps import require_roles
from app.models.enums import UserRole

router = APIRouter()


@router.get("")
def list_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                     _=Depends(require_roles(UserRole.SUPER_ADMIN))):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()
    return [{"id": l.id, "user_id": l.user_id, "action": l.action, "entity_type": l.entity_type,
             "entity_id": l.entity_id, "details": l.details, "timestamp": l.timestamp} for l in logs]
