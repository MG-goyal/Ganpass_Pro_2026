from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class AnnouncementBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    title: str
    message: Optional[str] = Field(default="", alias="description")
    description: Optional[str] = None
    priority: Optional[int] = 1
    is_active: Optional[bool] = Field(default=True, alias="isActive")
    isActive: Optional[bool] = None
    is_visible: Optional[bool] = Field(default=True, alias="isVisible")
    isVisible: Optional[bool] = None
    action_label: Optional[str] = Field(default="", alias="actionLabel")
    actionLabel: Optional[str] = None
    action_url: Optional[str] = Field(default="", alias="actionUrl")
    actionUrl: Optional[str] = None
    badge_text: Optional[str] = Field(default="Alert", alias="badgeText")
    badgeText: Optional[str] = None
    start_at: Optional[str] = Field(default="", alias="startAt")
    startAt: Optional[str] = None
    end_at: Optional[str] = Field(default="", alias="endAt")
    endAt: Optional[str] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    title: Optional[str] = None
    message: Optional[str] = Field(default=None, alias="description")
    description: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = Field(default=None, alias="isActive")
    isActive: Optional[bool] = None
    is_visible: Optional[bool] = Field(default=None, alias="isVisible")
    isVisible: Optional[bool] = None
    action_label: Optional[str] = Field(default=None, alias="actionLabel")
    actionLabel: Optional[str] = None
    action_url: Optional[str] = Field(default=None, alias="actionUrl")
    actionUrl: Optional[str] = None
    badge_text: Optional[str] = Field(default=None, alias="badgeText")
    badgeText: Optional[str] = None
    start_at: Optional[str] = Field(default=None, alias="startAt")
    startAt: Optional[str] = None
    end_at: Optional[str] = Field(default=None, alias="endAt")
    endAt: Optional[str] = None

class AnnouncementResponse(AnnouncementBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None