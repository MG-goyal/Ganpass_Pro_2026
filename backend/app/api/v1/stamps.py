from datetime import datetime, timezone
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import settings
from app.api.deps import get_db, get_current_user, get_optional_user
from app.schemas.stamp import (
    CheckinRequest,
    CheckinResponse,
    StampProgressResponse,
    StampRecordResponse,
    FeaturedStampItem,
)
from app.schemas.mandal import MandalResponse
from app.api.v1.mandals import normalize_mandal_doc
from app.utils.geo import calculate_haversine_distance_meters, is_within_checkin_radius

router = APIRouter(prefix="/stamps", tags=["GanPass Stamps & GPS Check-in"])

@router.post("/checkin", response_model=CheckinResponse)
async def checkin_and_collect_stamp(
    data: CheckinRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    GPS-Verified GanPass Check-in and Stamp Collection:
    Validates user GPS coordinates against the Mandal coordinates within CHECKIN_RADIUS_METERS.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not ready")

    mandal_doc = await db.mandals.find_one({"$or": [{"id": data.mandal_id}, {"slug": data.mandal_id}]})
    if not mandal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "MANDAL_NOT_FOUND", "message": f"Mandal '{data.mandal_id}' does not exist."}
        )

    mandal_norm = normalize_mandal_doc(mandal_doc)
    mandal_lat = mandal_norm["latitude"]
    mandal_lng = mandal_norm["longitude"]

    max_radius = getattr(settings, "CHECKIN_RADIUS_METERS", 500.0)
    is_within, dist_meters = is_within_checkin_radius(
        user_lat=data.latitude,
        user_lng=data.longitude,
        mandal_lat=mandal_lat,
        mandal_lng=mandal_lng,
        max_radius_meters=max_radius
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    user_id = str(current_user.get("id") or current_user.get("_id"))

    if not is_within:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OUT_OF_RADIUS",
                "message": f"GPS Verification Failed: You are {dist_meters:.1f} meters away from {mandal_norm['name']}. You must be within {max_radius:.0f}m to stamp your GanPass.",
                "distance_meters": dist_meters,
                "required_radius_meters": max_radius,
            }
        )

    existing_stamp = await db.stamps.find_one({
        "user_id": user_id,
        "mandal_id": mandal_norm["id"]
    })

    checkin_record = {
        "id": f"checkin-{uuid.uuid4().hex[:10]}",
        "user_id": user_id,
        "mandal_id": mandal_norm["id"],
        "user_lat": data.latitude,
        "user_lng": data.longitude,
        "distance_meters": dist_meters,
        "created_at": now_iso
    }
    await db.checkins.insert_one(checkin_record)

    if existing_stamp:
        return CheckinResponse(
            success=True,
            is_new=False,
            message=f"You have already collected the divine darshan stamp for {mandal_norm['name']}.",
            mandal=MandalResponse(**mandal_norm),
            distance_meters=dist_meters,
            stamped_at=existing_stamp.get("created_at", now_iso)
        )

    stamp_doc = {
        "id": f"stamp-{uuid.uuid4().hex[:10]}",
        "user_id": user_id,
        "mandal_id": mandal_norm["id"],
        "created_at": now_iso
    }
    await db.stamps.insert_one(stamp_doc)

    await db.users.update_one(
        {"$or": [{"id": user_id}, {"_id": user_id}]},
        {"$addToSet": {"stamps": mandal_norm["id"]}}
    )

    return CheckinResponse(
        success=True,
        is_new=True,
        message=f"Verified! Successfully collected the GanPass 10 stamp for {mandal_norm['name']}.",
        mandal=MandalResponse(**mandal_norm),
        distance_meters=dist_meters,
        stamped_at=now_iso
    )

@router.get("/progress", response_model=StampProgressResponse)
async def get_stamp_progress(
    current_user: dict = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Calculates Passport Progress: collected count, remaining stamps, percentage, and 10 stamp slots.
    """
    if db is None:
        return StampProgressResponse(
            collected_count=0,
            total_featured=10,
            percentage=0,
            collected_ids=[],
            featured_mandals=[]
        )

    collected_ids = []
    if current_user:
        user_id = str(current_user.get("id") or current_user.get("_id"))
        cursor = db.stamps.find({"user_id": user_id})
        async for s in cursor:
            collected_ids.append(s["mandal_id"])

    cursor = db.mandals.find({
        "$and": [
            {"$or": [{"is_featured": True}, {"isFeatured10": True}]},
            {"$or": [{"is_active": True}, {"isActive": True}, {"is_active": {"$exists": False}}]}
        ]
    }).sort([
        ("featured_order", 1),
        ("featuredOrder", 1),
        ("name", 1)
    ]).limit(10)

    featured_list = []
    async for doc in cursor:
        m = MandalResponse(**normalize_mandal_doc(doc))
        is_col = m.id in collected_ids
        featured_list.append(FeaturedStampItem(
            mandal=m,
            is_collected=is_col,
            collected_order=m.featured_order or m.featuredOrder
        ))

    total_featured = len(featured_list) or 10
    collected_count = len([f for f in featured_list if f.is_collected])
    percentage = int(round((collected_count / total_featured) * 100)) if total_featured > 0 else 0

    return StampProgressResponse(
        collected_count=collected_count,
        total_featured=total_featured,
        percentage=percentage,
        collected_ids=collected_ids,
        featured_mandals=featured_list
    )

@router.get("/my-stamps", response_model=List[StampRecordResponse])
async def get_my_stamps(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        return []

    user_id = str(current_user.get("id") or current_user.get("_id"))
    cursor = db.stamps.find({"user_id": user_id}).sort("created_at", -1)
    results = []
    async for s in cursor:
        mandal_doc = await db.mandals.find_one({"$or": [{"id": s["mandal_id"]}, {"slug": s["mandal_id"]}]})
        m_name = mandal_doc.get("name") if mandal_doc else s["mandal_id"]
        results.append(StampRecordResponse(
            mandalId=s["mandal_id"],
            mandalName=m_name,
            stampedAt=s.get("created_at", ""),
            collectedAt=s.get("created_at", "")
        ))
    return results

@router.delete("/{mandal_id}")
async def remove_stamp(
    mandal_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        return {"success": True}

    user_id = str(current_user.get("id") or current_user.get("_id"))
    await db.stamps.delete_many({"user_id": user_id, "mandal_id": mandal_id})
    await db.users.update_one(
        {"$or": [{"id": user_id}, {"_id": user_id}]},
        {"$pull": {"stamps": mandal_id}}
    )
    return {"success": True, "message": f"Stamp for {mandal_id} removed."}

@router.post("/reset")
async def reset_all_stamps(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        return {"success": True}

    user_id = str(current_user.get("id") or current_user.get("_id"))
    await db.stamps.delete_many({"user_id": user_id})
    await db.users.update_one(
        {"$or": [{"id": user_id}, {"_id": user_id}]},
        {"$set": {"stamps": []}}
    )
    return {"success": True, "message": "All stamps reset."}