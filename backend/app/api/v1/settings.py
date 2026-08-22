from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db, get_current_admin
from app.schemas.settings import SiteSettingsBase, SiteSettingsUpdate, SiteSettingsResponse

router = APIRouter(prefix="/settings", tags=["Festival Configuration & Site Settings"])

DEFAULT_SETTINGS = {
    "key": "main_settings",
    "festival_name": "Mumbai Sarvajanik Ganeshotsav",
    "festival_edition": "2026 - 134th Year",
    "festival_start_date": "2026-09-14",
    "festival_end_date": "2026-09-24",
    "show_events": True,
    "show_announcements": True,
    "show_featured": True,
    "show_planner": True,
    "show_explore": True,
    "checkin_enabled": True,
    "passport_enabled": True,
    "registration_enabled": True,
    "checkin_radius_meters": 150.0,
    "featured_limit": 10,
    "maintenance_mode": False,
    "contact_email": "helpdesk@ganpass.in",
    "instagram": "@ganpass_mumbai",
    "website": "https://ganpass.in",
    "emergency_helpline": "112 / 100",
}

@router.get("", response_model=SiteSettingsResponse)
async def get_site_settings(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Get full festival and system settings.
    """
    if db is None:
        return SiteSettingsResponse(**DEFAULT_SETTINGS)

    doc = await db.settings.find_one({"key": "main_settings"})
    if not doc:
        doc = dict(DEFAULT_SETTINGS)
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.settings.insert_one(doc)

    doc.pop("_id", None)
    return SiteSettingsResponse(**doc)

@router.put("", response_model=SiteSettingsResponse)
async def update_site_settings(
    data: SiteSettingsUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Admin: Update festival settings, feature toggles, and emergency lines.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    update_fields = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.settings.update_one(
        {"key": "main_settings"},
        {"$set": update_fields},
        upsert=True
    )

    doc = await db.settings.find_one({"key": "main_settings"})
    doc.pop("_id", None)
    return SiteSettingsResponse(**doc)

@router.get("/public", response_model=SiteSettingsResponse)
async def get_public_festival_config(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Public festival metadata used by header and footer.
    """
    return await get_site_settings(db=db)
