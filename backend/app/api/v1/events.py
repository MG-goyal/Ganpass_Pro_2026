from datetime import datetime, timezone
import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from pydantic import BaseModel, Field

from app.api.deps import get_db, get_current_admin
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter(prefix="/events", tags=["Events"])

def compute_event_status(start_at: Optional[str] = None, end_at: Optional[str] = None) -> str:
    if not start_at:
        return "UPCOMING"
    try:
        now = datetime.now(timezone.utc)
        start_time = datetime.fromisoformat(start_at.replace("Z", "+00:00"))
        if end_at:
            end_time = datetime.fromisoformat(end_at.replace("Z", "+00:00"))
        else:
            end_time = start_time

        if now < start_time:
            return "UPCOMING"
        elif start_time <= now <= end_time:
            return "LIVE"
        else:
            return "COMPLETED"
    except Exception:
        return "UPCOMING"

def normalize_event_doc(doc: dict) -> dict:
    if not doc:
        return doc
    
    raw_id = str(doc.get("id") or doc.get("_id") or "")
    doc["id"] = raw_id
    doc.pop("_id", None)

    start_str = str(doc.get("start_at") or doc.get("startTime") or "")
    end_str = str(doc.get("end_at") or doc.get("endTime") or "")

    doc["title"] = doc.get("title") or doc.get("name") or "Festival Event"
    doc["name"] = doc["title"]
    doc["mandal_id"] = str(doc.get("mandal_id") or doc.get("mandalId") or "")
    doc["mandalId"] = doc["mandal_id"]
    doc["start_at"] = start_str
    doc["startTime"] = start_str
    doc["end_at"] = end_str
    doc["endTime"] = end_str
    doc["status"] = compute_event_status(start_str, end_str)
    
    loc = doc.get("location") or doc.get("locationDescription") or doc.get("location_description") or ""
    doc["location"] = loc
    doc["locationDescription"] = loc
    doc["address"] = doc.get("address") or ""
    
    try:
        lat = float(doc.get("latitude") or doc.get("coordinates", {}).get("lat") or 18.9912)
    except (TypeError, ValueError):
        lat = 18.9912
    try:
        lng = float(doc.get("longitude") or doc.get("coordinates", {}).get("lng") or 72.8361)
    except (TypeError, ValueError):
        lng = 72.8361
        
    doc["latitude"] = lat
    doc["longitude"] = lng
    doc["coordinates"] = {"lat": lat, "lng": lng}

    # Strict fallback: if is_visible is null/missing, default to True
    is_vis = doc.get("is_visible")
    if is_vis is None:
        is_vis = doc.get("isVisible", True)
    doc["is_visible"] = bool(is_vis)
    doc["isVisible"] = bool(is_vis)

    doc["image"] = doc.get("image") or doc.get("heroImageUrl") or ""
    doc["heroImageUrl"] = doc["image"]

    return doc

def build_id_query(id_str: str) -> dict:
    conditions = [{"id": id_str}, {"slug": id_str}]
    if ObjectId.is_valid(id_str):
        conditions.append({"_id": ObjectId(id_str)})
    return {"$or": conditions}

@router.get("", response_model=List[EventResponse])
@router.get("/", response_model=List[EventResponse])
async def get_events(
    type: Optional[str] = None,
    mandal_id: Optional[str] = None,
    include_hidden: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Retrieve all scheduled events."""
    if db is None:
        return []

    query = {}
    if not include_hidden:
        query["$or"] = [
            {"is_visible": True},
            {"isVisible": True},
            {"is_visible": {"$exists": False}}
        ]

    if type and type != "All" and type != "ALL":
        query["type"] = type

    if mandal_id:
        query["$or"] = [{"mandal_id": mandal_id}, {"mandalId": mandal_id}]

    cursor = db.events.find(query).sort("start_at", 1)
    events = []
    async for doc in cursor:
        events.append(EventResponse(**normalize_event_doc(doc)))

    return events

@router.get("/{id}", response_model=EventResponse)
async def get_event_by_id(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Fetch single event details by ID."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    doc = await db.events.find_one(build_id_query(id))
    if not doc:
        doc = await db.events.find_one({"$or": [{"id": id}, {"slug": id}]})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")

    return EventResponse(**normalize_event_doc(doc))

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Publish a new festival event."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    raw_title = data.title or data.name or "event"
    slug_base = re.sub(r'[^a-z0-9]+', '-', raw_title.lower()).strip('-') or f"event-{int(datetime.now().timestamp())}"
    
    count = await db.events.count_documents({"id": slug_base})
    final_id = slug_base if count == 0 else f"{slug_base}-{count + 1}"

    doc = data.model_dump(exclude_unset=False)
    doc["id"] = final_id
    doc["slug"] = final_id
    doc["created_at"] = now_iso
    doc["updated_at"] = now_iso
    doc["is_visible"] = True
    doc["isVisible"] = True
    doc = normalize_event_doc(doc)

    await db.events.insert_one(doc)
    return EventResponse(**doc)

@router.put("/{id}", response_model=EventResponse)
async def update_event(
    id: str,
    data: EventUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Update an existing scheduled event."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    existing = await db.events.find_one(build_id_query(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    update_fields = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.events.update_one({"_id": existing["_id"]}, {"$set": update_fields})
    updated_doc = await db.events.find_one({"_id": existing["_id"]})
    return EventResponse(**normalize_event_doc(updated_doc))

@router.delete("/{id}")
async def delete_event(
    id: str,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin: Delete an event permanently."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    existing = await db.events.find_one(build_id_query(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.events.delete_one({"_id": existing["_id"]})
    return {"success": True, "message": f"Event '{existing.get('title', id)}' deleted."}