from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class MandalCoordinates(BaseModel):
    lat: float = 18.9912
    lng: float = 72.8361

class MandalBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    marathi_name: Optional[str] = Field(default="", alias="marathiName")
    slug: Optional[str] = None
    zone: Optional[str] = "South Mumbai"
    area: Optional[str] = ""
    address: Optional[str] = ""
    nearest_station: Optional[str] = Field(default="", alias="nearestStation")
    established_year: Optional[int] = Field(default=1934, alias="establishedYear")
    category: Optional[str] = "Famous"
    description: Optional[str] = ""
    why_visit: Optional[str] = Field(default="", alias="whyVisit")
    history: Optional[str] = ""
    visiting_information: Optional[str] = Field(default="", alias="visitingInformation")
    how_to_reach: Optional[str] = Field(default="", alias="howToReach")
    crowd_wait_estimate: Optional[str] = Field(default="1 - 2 Hours", alias="crowdWaitEstimate")
    avg_darshan_time_mins: Optional[int] = 45
    hero_image_url: Optional[str] = Field(default="", alias="heroImageUrl")
    image: Optional[str] = ""
    is_featured: Optional[bool] = Field(default=False, alias="isFeatured10")
    featured_order: Optional[int] = Field(default=1, alias="featuredOrder")
    is_active: Optional[bool] = Field(default=True, alias="isActive")
    latitude: Optional[float] = 18.9912
    longitude: Optional[float] = 72.8361
    coordinates: Optional[MandalCoordinates] = None

class MandalCreate(MandalBase):
    pass

class MandalUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    marathi_name: Optional[str] = Field(default=None, alias="marathiName")
    slug: Optional[str] = None
    zone: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    nearest_station: Optional[str] = Field(default=None, alias="nearestStation")
    established_year: Optional[int] = Field(default=None, alias="establishedYear")
    category: Optional[str] = None
    description: Optional[str] = None
    why_visit: Optional[str] = Field(default=None, alias="whyVisit")
    history: Optional[str] = None
    visiting_information: Optional[str] = Field(default=None, alias="visitingInformation")
    how_to_reach: Optional[str] = Field(default=None, alias="howToReach")
    crowd_wait_estimate: Optional[str] = Field(default=None, alias="crowdWaitEstimate")
    avg_darshan_time_mins: Optional[int] = None
    hero_image_url: Optional[str] = Field(default=None, alias="heroImageUrl")
    image: Optional[str] = None
    is_featured: Optional[bool] = Field(default=None, alias="isFeatured10")
    featured_order: Optional[int] = Field(default=None, alias="featuredOrder")
    is_active: Optional[bool] = Field(default=None, alias="isActive")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    coordinates: Optional[MandalCoordinates] = None

class MandalResponse(MandalBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class MandalDetailResponse(MandalResponse):
    nearby_mandals: Optional[List[MandalResponse]] = []