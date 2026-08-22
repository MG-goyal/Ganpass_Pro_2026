from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
from app.schemas.mandal import MandalCoordinates

class EventStatusEnum(str, Enum):
    UPCOMING = "UPCOMING"
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"

class EventBase(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: str
    type: str = "Agman"
    image: Optional[str] = ""
    heroImageUrl: Optional[str] = None
    location: str
    locationDescription: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    coordinates: Optional[MandalCoordinates] = None
    start_at: str
    startTime: Optional[str] = None
    end_at: str
    endTime: Optional[str] = None
    is_visible: bool = True
    isVisible: Optional[bool] = None
    mandal_id: Optional[str] = None
    mandalId: Optional[str] = None
    organizer: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    image: Optional[str] = None
    heroImageUrl: Optional[str] = None
    location: Optional[str] = None
    locationDescription: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    coordinates: Optional[MandalCoordinates] = None
    start_at: Optional[str] = None
    startTime: Optional[str] = None
    end_at: Optional[str] = None
    endTime: Optional[str] = None
    is_visible: Optional[bool] = None
    isVisible: Optional[bool] = None
    mandal_id: Optional[str] = None
    mandalId: Optional[str] = None
    organizer: Optional[str] = None

class EventResponse(EventBase):
    id: str
    status: Optional[str] = "UPCOMING"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
