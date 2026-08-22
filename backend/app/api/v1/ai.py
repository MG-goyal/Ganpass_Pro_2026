import os
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import settings
from app.api.deps import get_db
from app.schemas.ai import AIAssistantRequest, AIAssistantResponse

router = APIRouter(prefix="/ai", tags=["Server-Side Gemini AI Assistant"])

@router.post("/ask", response_model=AIAssistantResponse)
async def ask_darshan_assistant(
    req: AIAssistantRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Server-side Gemini AI Darshan Guide: answers pilgrimage queries, offers real-time crowd tips,
    and recommends mandals without exposing the API key to the client.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY

    # Gather contextual mandal info if available
    context_text = ""
    if db is not None:
        if req.context_mandal_id:
            mandal = await db.mandals.find_one({"id": req.context_mandal_id})
            if mandal:
                context_text = f"User is asking about Mandal: {mandal.get('name')}, located in {mandal.get('area')}. Why visit: {mandal.get('why_visit')}. Visiting info: {mandal.get('visiting_information')}."

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""
You are the official GanPass 2026 Mumbai Ganesh Festival AI Guide.
Context: {context_text}
User Question: {req.query}

Provide a concise, respectful, authentic answer with practical Darshan timings, crowd management advice, nearest local train stations, and cultural significance in Mumbai.
Keep your response under 150 words.
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            answer_text = response.text or "May Lord Ganesha bless your pilgrimage in Mumbai."
            return AIAssistantResponse(
                answer=answer_text,
                recommendations=[
                    "Visit early morning (6 AM - 8 AM) for minimal waiting time",
                    "Take the Western/Central railway to avoid major road bottlenecks",
                    "Collect your verified GanPass 10 stamp upon arrival"
                ]
            )
        except Exception as e:
            pass

    # Intelligent deterministic fallback
    return AIAssistantResponse(
        answer=f"For {req.query.strip() or 'your GanPass pilgrimage'}, we recommend planning early morning darshan between 06:00 AM and 09:00 AM. Key mandals like Lalbaugcha Raja, GSB Seva Mandal, and Mumbaicha Raja have dedicated queues and footwear counters. Use local suburban trains to Chinchpokli, Currey Road, or King's Circle.",
        recommendations=[
            "Early morning slots (6 AM - 9 AM) have shortest queues",
            "Use Central Railway for Lalbaug, Chinchpokli and Western Railway for Girgaon and Khetwadi",
            "Keep GPS enabled to collect your official GanPass stamp within 150m"
        ],
        suggested_mandals=["lalbaugcha-raja", "gsb-seva-mandal", "chinchpokli-chintamani"]
    )
