from typing import Optional, List
from pydantic import BaseModel
from app.schemas.mandal import MandalResponse, MandalCoordinates

class PlannerRequestSchema(BaseModel):
    starting_location: str
    start_coords: Optional[MandalCoordinates] = None
    start_time: Optional[str] = "09:00"
    available_time_mins: int = 240
    travel_mode: str = "Train"
    visit_preference: str = "Famous"
    max_stops: Optional[int] = 5

class PlannerStopSchema(BaseModel):
    stop_number: int
    mandal: MandalResponse
    visit_duration_mins: int
    travel_to_next_mins: int
    travel_distance_next_km: float
    arrival_time: str
    departure_time: str
    travel_tip: Optional[str] = ""

class PlannerResultSchema(BaseModel):
    id: str
    title: str
    total_time_mins: int
    total_visit_time_mins: int
    total_travel_time_mins: int
    buffer_mins: int
    stops_count: int
    stops: List[PlannerStopSchema]
    starting_location: str
    travel_mode: str
    created_at: str
