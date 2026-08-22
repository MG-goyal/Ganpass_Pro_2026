from typing import Optional, List
from pydantic import BaseModel
from app.schemas.mandal import MandalResponse, MandalCoordinates

class CheckinRequest(BaseModel):
    mandal_id: str
    latitude: float
    longitude: float

class CheckinResponse(BaseModel):
    success: bool
    is_new: bool
    message: str
    mandal: Optional[MandalResponse] = None
    distance_meters: Optional[float] = None
    stamped_at: str

class StampRecordResponse(BaseModel):
    mandalId: str
    mandalName: Optional[str] = None
    stampedAt: str
    collectedAt: Optional[str] = None
    coordinates: Optional[MandalCoordinates] = None

class FeaturedStampItem(BaseModel):
    mandal: MandalResponse
    is_collected: bool
    collected_order: Optional[int] = None

class StampProgressResponse(BaseModel):
    collected_count: int
    total_featured: int
    percentage: int
    collected_ids: List[str]
    featured_mandals: List[FeaturedStampItem]
