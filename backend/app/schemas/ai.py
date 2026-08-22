from typing import Optional, List
from pydantic import BaseModel

class AIAssistantRequest(BaseModel):
    query: str
    context_mandal_id: Optional[str] = None
    user_location: Optional[dict] = None

class AIAssistantResponse(BaseModel):
    answer: str
    recommendations: Optional[List[str]] = None
    suggested_mandals: Optional[List[str]] = None
