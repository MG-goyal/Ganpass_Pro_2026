from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.api.deps import get_db, get_current_admin
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse

router = APIRouter(prefix="/announcements", tags=["Announcements & Broadcast Banners"])

def normalize_ann_doc(doc: dict) -> dict:
    if not doc:
        return doc
    raw_id = str(doc.get("id") or doc.get("_id") or "")
    doc["id"] = raw_id
    doc.pop("_id", None)
    
    # Synchronize is_active and is_visible across all schemas
    is_active_val = doc.get("is_active")
    if is_active_val is None:
        is_active_val = doc.get("is_visible")
    if is_active_val is None:
        is_active_val = doc.get("isActive", True)
        
    doc["is_active"] = bool(is_active_val)
    doc["isActive"] = bool(is_active_val)
    doc["is_visible"] = bool(is_active_val)
    doc["isVisible"] = bool(is_active_val)
    
    # Aliases
    doc["action_label"] = doc.get("action_label") or doc.get("actionLabel") or ""
    doc["actionLabel"] = doc["action_label"]
    doc["action_url"] = doc.get("action_url") or doc.get("actionUrl") or ""
    doc["actionUrl"] = doc["action_url"]
    return doc

def build_announcement_query(id_str: str) -> dict:
    conditions = [{"id": id_str}, {"slug": id_str}]
    if ObjectId.is_valid(id_str):
        conditions.append({"_id": ObjectId(id_str)})
    return {"$or": conditions}

def is_announcement_currently_active(doc: dict) -> bool:
    norm = normalize_ann_doc(doc)
    if not norm.get("is_active", True):
        return False
    try:
        now = datetime.now(timezone.utc)
        if norm.get("start_at") and norm.get("end_at"):
            start = datetime.fromisoformat(norm["start_at"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(norm["end_at"].replace("Z", "+00:00"))
            return start <= now <= end
        return True
    except Exception:
        return norm.get("is_active", True)

@router.get("", response_model=List[AnnouncementResponse])
@router.get("/", response_model=List[AnnouncementResponse])
@router.get("/active", response_model=List[AnnouncementResponse])
async def get_announcements(
    include_hidden: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Public & Admin Announcements Endpoint:
    When include_hidden=True, returns all announcements for the admin panel.
    Otherwise, returns only currently active broadcast alerts.
    """
    if db is None:
        return []

    cursor = db.announcements.find({}).sort([("priority", -1), ("created_at", -1)])
    results = []
    async for doc in cursor:
        norm = normalize_ann_doc(doc)
        if include_hidden or is_announcement_currently_active(doc):
            results.append(AnnouncementResponse(**norm))
    return results

@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Publish a new live broadcast alert."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    new_id = f"announcement-{uuid.uuid4().hex[:8]}"

    doc = data.model_dump(exclude_unset=False)
    doc["id"] = new_id
    doc["created_at"] = now_iso
    doc["updated_at"] = now_iso
    doc["is_active"] = True
    doc["is_visible"] = True
    doc = normalize_ann_doc(doc)

    await db.announcements.insert_one(doc)
    return AnnouncementResponse(**doc)

@router.put("/{id}", response_model=AnnouncementResponse)
async def update_announcement(
    id: str,
    data: AnnouncementUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Toggle visibility or edit broadcast contents."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    existing = await db.announcements.find_one(build_announcement_query(id))
    if not existing:
        raise HTTPException(
            status_code=404,
            detail={"code": "ANNOUNCEMENT_NOT_FOUND", "message": f"Announcement with ID '{id}' not found."}
        )

    update_fields = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    
    # Sync status booleans
    if "is_active" in update_fields:
        update_fields["is_visible"] = update_fields["is_active"]
        update_fields["isActive"] = update_fields["is_active"]
    elif "is_visible" in update_fields:
        update_fields["is_active"] = update_fields["is_visible"]
        update_fields["isActive"] = update_fields["is_visible"]

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.announcements.update_one({"_id": existing["_id"]}, {"$set": update_fields})
    updated_doc = await db.announcements.find_one({"_id": existing["_id"]})
    return AnnouncementResponse(**normalize_ann_doc(updated_doc))

@router.delete("/{id}")
async def delete_announcement(
    id: str,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Permanently delete broadcast alert."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    existing = await db.announcements.find_one(build_announcement_query(id))
    if not existing:
        raise HTTPException(
            status_code=404,
            detail={"code": "ANNOUNCEMENT_NOT_FOUND", "message": f"Announcement with ID '{id}' not found."}
        )

    await db.announcements.delete_one({"_id": existing["_id"]})
    return {"success": True, "message": f"Announcement '{id}' deleted."}