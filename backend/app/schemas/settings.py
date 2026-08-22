from typing import Optional
from pydantic import BaseModel

class SiteSettingsBase(BaseModel):
    festival_name: str = "Mumbai Sarvajanik Ganeshotsav"
    festival_edition: str = "2026 - 134th Year"
    festival_start_date: str = "2026-09-14"
    festival_end_date: str = "2026-09-24"
    show_events: bool = True
    show_announcements: bool = True
    show_featured: bool = True
    show_planner: bool = True
    show_explore: bool = True
    checkin_enabled: bool = True
    passport_enabled: bool = True
    registration_enabled: bool = True
    checkin_radius_meters: float = 150.0
    featured_limit: int = 10
    maintenance_mode: bool = False
    contact_email: str = "helpdesk@ganpass.in"
    instagram: str = "@ganpass_mumbai"
    website: str = "https://ganpass.in"
    emergency_helpline: str = "112 / 100"

class SiteSettingsUpdate(BaseModel):
    festival_name: Optional[str] = None
    festival_edition: Optional[str] = None
    festival_start_date: Optional[str] = None
    festival_end_date: Optional[str] = None
    show_events: Optional[bool] = None
    show_announcements: Optional[bool] = None
    show_featured: Optional[bool] = None
    show_planner: Optional[bool] = None
    show_explore: Optional[bool] = None
    checkin_enabled: Optional[bool] = None
    passport_enabled: Optional[bool] = None
    registration_enabled: Optional[bool] = None
    checkin_radius_meters: Optional[float] = None
    featured_limit: Optional[int] = None
    maintenance_mode: Optional[bool] = None
    contact_email: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    emergency_helpline: Optional[str] = None

class SiteSettingsResponse(SiteSettingsBase):
    id: Optional[str] = "main_settings"
    updated_at: Optional[str] = None
