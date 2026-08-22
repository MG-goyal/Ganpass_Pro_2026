from datetime import datetime, timezone
import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from pydantic import BaseModel

from app.api.deps import get_db, get_current_admin
from app.schemas.mandal import MandalCreate, MandalUpdate, MandalResponse, MandalDetailResponse
from app.utils.geo import calculate_haversine_distance_km

router = APIRouter(prefix="/mandals", tags=["Mandals"])

def normalize_mandal_doc(doc: dict) -> dict:
    if not doc:
        return doc
    
    raw_id = str(doc.get("id") or doc.get("_id") or "")
    doc["id"] = raw_id
    doc.pop("_id", None)

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

    # Strict boolean normalization: only True if explicitly true in DB
    raw_featured = doc.get("is_featured")
    if raw_featured is None:
        raw_featured = doc.get("isFeatured10", False)
    
    is_feat_bool = bool(raw_featured) is True
    doc["is_featured"] = is_feat_bool
    doc["isFeatured10"] = is_feat_bool

    # Active status normalization
    raw_active = doc.get("is_active")
    if raw_active is None:
        raw_active = doc.get("isActive", True)
    is_act_bool = bool(raw_active) is not False
    doc["is_active"] = is_act_bool
    doc["isActive"] = is_act_bool

    # Order normalization
    doc["featured_order"] = doc.get("featured_order") or doc.get("featuredOrder")
    doc["featuredOrder"] = doc["featured_order"]

    # Text fallbacks
    if "why_visit" not in doc and "whyVisit" in doc:
        doc["why_visit"] = doc["whyVisit"]
    if "visiting_information" not in doc and "visitingInformation" in doc:
        doc["visiting_information"] = doc["visitingInformation"]
    if "how_to_reach" not in doc and "howToReach" in doc:
        doc["how_to_reach"] = doc["howToReach"]
    if "image" not in doc and "heroImageUrl" in doc:
        doc["image"] = doc["heroImageUrl"]

    return doc

def build_id_query(id_str: str) -> dict:
    conditions = [{"id": id_str}, {"slug": id_str}]
    if ObjectId.is_valid(id_str):
        conditions.append({"_id": ObjectId(id_str)})
    return {"$or": conditions}

class FeaturedSlotsPayload(BaseModel):
    slots: List[Dict[str, Any]]

@router.get("", response_model=List[MandalResponse])
@router.get("/", response_model=List[MandalResponse])
async def get_mandals(
    search: Optional[str] = None,
    area: Optional[str] = None,
    category: Optional[str] = None,
    featuredOnly: Optional[bool] = False,
    limit: int = Query(100, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        return []

    query = {}
    if area and area != "All":
        query["area"] = {"$regex": re.escape(area), "$options": "i"}
    if category and category != "All":
        query["category"] = category
    if featuredOnly:
        query["$or"] = [{"is_featured": True}, {"isFeatured10": True}]
    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"name": {"$regex": re.escape(s), "$options": "i"}},
            {"marathi_name": {"$regex": re.escape(s), "$options": "i"}},
            {"area": {"$regex": re.escape(s), "$options": "i"}},
            {"tags": {"$in": [re.compile(re.escape(s), re.IGNORECASE)]}},
        ]

    cursor = db.mandals.find(query).sort([("is_featured", -1), ("featured_order", 1), ("name", 1)]).limit(limit)
    mandals = []
    async for doc in cursor:
        mandals.append(MandalResponse(**normalize_mandal_doc(doc)))
    return mandals

# --- Static /featured routes placed above /{id} ---

@router.get("/featured", response_model=List[MandalResponse])
async def get_featured_mandals(db: AsyncIOMotorDatabase = Depends(get_db)):
    if db is None:
        return []

    query = {
        "$and": [
            {"$or": [{"is_featured": True}, {"isFeatured10": True}]},
            {"$or": [{"is_active": True}, {"isActive": True}, {"is_active": {"$exists": False}}]}
        ]
    }

    cursor = db.mandals.find(query).sort([
        ("featured_order", 1),
        ("featuredOrder", 1),
        ("name", 1)
    ]).limit(10)

    featured = []
    async for doc in cursor:
        featured.append(MandalResponse(**normalize_mandal_doc(doc)))
    return featured

@router.put("/featured")
async def update_featured_circuit(
    payload: FeaturedSlotsPayload,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()

    # Step 1: Wipe all old featured flags across all mandals
    await db.mandals.update_many(
        {},
        {
            "$set": {
                "is_featured": False,
                "isFeatured10": False,
                "featured_order": None,
                "featuredOrder": None
            }
        }
    )

    # Step 2: Set featured flags ONLY for the designated slots (1 to 10)
    for slot in payload.slots:
        slot_num = slot.get("slotNumber") or slot.get("slot_number")
        mandal_id = slot.get("mandalId") or slot.get("mandal_id") or slot.get("id")

        if mandal_id and slot_num is not None:
            await db.mandals.update_one(
                build_id_query(str(mandal_id)),
                {
                    "$set": {
                        "is_featured": True,
                        "isFeatured10": True,
                        "featured_order": int(slot_num),
                        "featuredOrder": int(slot_num),
                        "updated_at": now_iso
                    }
                }
            )

    return {"success": True, "message": "Circuit updated successfully."}

@router.post("/featured/reset")
async def reset_all_featured_flags(
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin tool: Resets all mandals to unfeatured (false)."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    await db.mandals.update_many(
        {},
        {"$set": {"is_featured": False, "isFeatured10": False, "featured_order": None, "featuredOrder": None}}
    )
    return {"success": True, "message": "All mandal featured flags reset to false."}

@router.get("/areas", response_model=List[str])
async def get_all_areas(db: AsyncIOMotorDatabase = Depends(get_db)):
    if db is None:
        return []
    areas = await db.mandals.distinct("area")
    return sorted([a for a in areas if a])

@router.get("/{id}", response_model=MandalDetailResponse)
async def get_mandal_by_id(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    query_conditions = [{"id": id}, {"slug": id}]
    if ObjectId.is_valid(id):
        query_conditions.append({"_id": ObjectId(id)})

    doc = await db.mandals.find_one({"$or": query_conditions})
    if not doc:
        raise HTTPException(
            status_code=404, 
            detail={"code": "MANDAL_NOT_FOUND", "message": f"Mandal with ID '{id}' not found."}
        )

    mandal_data = normalize_mandal_doc(doc)
    cur_lat = mandal_data.get("latitude", 18.9912)
    cur_lng = mandal_data.get("longitude", 72.8361)

    cursor = db.mandals.find({
        "$and": [
            {"$or": [{"is_active": True}, {"isActive": True}]},
            {"id": {"$ne": mandal_data.get("id")}}
        ]
    }).limit(8)

    all_others = []
    async for other in cursor:
        norm = normalize_mandal_doc(other)
        dist = calculate_haversine_distance_km(cur_lat, cur_lng, norm["latitude"], norm["longitude"])
        all_others.append((dist, MandalResponse(**norm)))

    all_others.sort(key=lambda x: x[0])
    nearby = [item[1] for item in all_others[:4]]

    return MandalDetailResponse(**mandal_data, nearby_mandals=nearby)

@router.post("", response_model=MandalResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MandalResponse, status_code=status.HTTP_201_CREATED)
async def create_mandal(
    data: MandalCreate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    now_iso = datetime.now(timezone.utc).isoformat()
    slug_base = re.sub(r'[^a-z0-9]+', '-', data.name.lower()).strip('-') or f"mandal-{int(datetime.now().timestamp())}"
    
    count = await db.mandals.count_documents({"slug": slug_base})
    final_id = slug_base if count == 0 else f"{slug_base}-{count + 1}"

    doc = data.model_dump()
    doc["id"] = final_id
    doc["slug"] = final_id
    doc["created_at"] = now_iso
    doc["updated_at"] = now_iso
    doc = normalize_mandal_doc(doc)

    await db.mandals.insert_one(doc)
    return MandalResponse(**doc)

@router.put("/{id}", response_model=MandalResponse)
async def update_mandal(
    id: str,
    data: MandalUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    existing = await db.mandals.find_one(build_id_query(id))
    if not existing:
        raise HTTPException(
            status_code=404, 
            detail={"code": "MANDAL_NOT_FOUND", "message": f"Mandal with ID '{id}' not found."}
        )

    update_fields = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    if "latitude" in update_fields or "longitude" in update_fields:
        lat = update_fields.get("latitude", existing.get("latitude", 18.9912))
        lng = update_fields.get("longitude", existing.get("longitude", 72.8361))
        update_fields["coordinates"] = {"lat": lat, "lng": lng}

    await db.mandals.update_one({"_id": existing["_id"]}, {"$set": update_fields})
    updated_doc = await db.mandals.find_one({"_id": existing["_id"]})
    return MandalResponse(**normalize_mandal_doc(updated_doc))

@router.delete("/{id}")
async def delete_mandal(
    id: str,
    hard_delete: bool = Query(True, description="Permanent delete from database if True"),
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    existing = await db.mandals.find_one(build_id_query(id))
    if not existing:
        raise HTTPException(
            status_code=404, 
            detail={"code": "MANDAL_NOT_FOUND", "message": f"Mandal with ID '{id}' not found."}
        )

    if hard_delete:
        await db.mandals.delete_one({"_id": existing["_id"]})
        return {
            "success": True, 
            "message": f"Mandal '{existing.get('name', id)}' permanently deleted."
        }
    else:
        await db.mandals.update_one(
            {"_id": existing["_id"]},
            {"$set": {"is_active": False, "is_featured": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {
            "success": True, 
            "message": f"Mandal '{existing.get('name', id)}' deactivated."
        }