from app.schemas.mandal import MandalBase, MandalCreate, MandalUpdate, MandalResponse, MandalDetailResponse, MandalCoordinates
from app.schemas.event import EventBase, EventCreate, EventUpdate, EventResponse, EventStatusEnum
from app.schemas.announcement import AnnouncementBase, AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.schemas.user import UserBase, UserRegister, UserLogin, AdminLogin, UserResponse, TokenResponse
from app.schemas.stamp import CheckinRequest, CheckinResponse, StampProgressResponse, StampRecordResponse
from app.schemas.settings import SiteSettingsBase, SiteSettingsUpdate, SiteSettingsResponse
from app.schemas.featured import FeaturedSlotItem, FeaturedSlotsUpdateRequest, FeaturedSlotsResponse
from app.schemas.dashboard import DashboardStatsResponse
from app.schemas.planner import PlannerRequestSchema, PlannerResultSchema, PlannerStopSchema
from app.schemas.ai import AIAssistantRequest, AIAssistantResponse
