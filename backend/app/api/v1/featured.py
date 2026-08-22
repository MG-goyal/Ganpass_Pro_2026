from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db, get_current_admin
from app.schemas.featured import FeaturedSlotsUpdateRequest, FeaturedSlotsResponse, FeaturedSlotItem
from app.schemas.mandal import MandalResponse
from app.api.v1.mandals import normalize_mandal_doc

router = APIRouter(prefix="/featured", tags=["Featured Top 10"])

@router.get("/slots", response_model=FeaturedSlotsResponse)
async def get_featured_slots(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Retrieves the 10 official GanPass stamp-eligible featured slots.
    """
    if db is None:
        return FeaturedSlotsResponse(success=True, slots=[], active_count=0)

    # Fetch all featured mandals
    cursor = db.mandals.find({"is_featured": True, "is_active": True}).sort("featured_order", 1)
    featured_list = []
    async for doc in cursor:
        featured_list.append(MandalResponse(**normalize_mandal_doc(doc)))

    slots = []
    for i in range(1, 11):
        assigned = next((m for m in featured_list if m.featured_order == i), None)
        if not assigned and i <= len(featured_list):
            assigned = featured_list[i - 1]
        slots.append(FeaturedSlotItem(slotNumber=i, mandal=assigned))

    active_count = len([s for s in slots if s.mandal is not None])
    return FeaturedSlotsResponse(success=True, slots=slots, active_count=active_count)

@router.put("/slots", response_model=FeaturedSlotsResponse)
async def update_featured_slots(
    payload: FeaturedSlotsUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Admin: Reorder or assign mandals into slots 1 through 10.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Reset all featured flags in database
    await db.mandals.update_many(
        {},
        {"$set": {"is_featured": False, "featured_order": None, "isFeatured10": False, "featuredOrder": None}}
    )

    # Update assigned slots
    for item in payload.slots[:10]:
        if item.mandalId:
            await db.mandals.update_one(
                {"$or": [{"id": item.mandalId}, {"slug": item.mandalId}]},
                {"$set": {
                    "is_featured": True,
                    "featured_order": item.slotNumber,
                    "isFeatured10": True,
                    "featuredOrder": item.slotNumber,
                }}
            )

    return await get_featured_slots(db=db)

@router.get("/top10", response_model=List[MandalResponse])
async def get_public_top10(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Public Top 10 list ordered by slot number (1 to 10).
    """
    if db is None:
        return []
    cursor = db.mandals.find({"is_featured": True, "is_active": True}).sort("featured_order", 1).limit(10)
    top10 = []
    async for doc in cursor:
        top10.append(MandalResponse(**normalize_mandal_doc(doc)))
    return top10
