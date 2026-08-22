from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.mandals import router as mandals_router
from app.api.v1.events import router as events_router
from app.api.v1.announcements import router as announcements_router
from app.api.v1.featured import router as featured_router
from app.api.v1.stamps import router as stamps_router
from app.api.v1.settings import router as settings_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.planner import router as planner_router
from app.api.v1.ai import router as ai_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(mandals_router)
api_router.include_router(events_router)
api_router.include_router(announcements_router)
api_router.include_router(featured_router)
api_router.include_router(stamps_router)
api_router.include_router(settings_router)
api_router.include_router(dashboard_router)
api_router.include_router(planner_router)
api_router.include_router(ai_router)
