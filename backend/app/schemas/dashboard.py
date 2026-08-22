from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    total_mandals: int
    featured_mandals: int
    upcoming_events: int
    live_events: int
    active_announcements: int
    plans_generated: int
    stamps_collected: int
    registered_users: int
