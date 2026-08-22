from typing import Optional, List
from pydantic import BaseModel
from app.schemas.mandal import MandalResponse

class FeaturedSlotItem(BaseModel):
    slotNumber: int
    mandal: Optional[MandalResponse] = None

class FeaturedSlotUpdateItem(BaseModel):
    slotNumber: int
    mandalId: Optional[str] = None

class FeaturedSlotsUpdateRequest(BaseModel):
    slots: List[FeaturedSlotUpdateItem]

class FeaturedSlotsResponse(BaseModel):
    success: bool
    slots: List[FeaturedSlotItem]
    active_count: int
