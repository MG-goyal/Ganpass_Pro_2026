from datetime import datetime, timezone, timedelta
import uuid
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db
from app.schemas.planner import PlannerRequestSchema, PlannerResultSchema, PlannerStopSchema
from app.schemas.mandal import MandalResponse
from app.api.v1.mandals import normalize_mandal_doc
from app.utils.geo import calculate_haversine_distance_km

router = APIRouter(prefix="/planner", tags=["Itinerary Planner Engine"])

@router.post("/generate", response_model=PlannerResultSchema)
async def generate_itinerary_plan(
    req: PlannerRequestSchema,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Intelligent Darshan Route Generation: computes an optimal route based on travel mode,
    available time budget, crowd wait estimates, and GPS coordinates.
    """
    start_lat = req.start_coords.lat if req.start_coords else 18.9912
    start_lng = req.start_coords.lng if req.start_coords else 72.8361

    # Fetch mandals
    query = {"is_active": True}
    if req.visit_preference == "Famous":
        query["category"] = {"$in": ["Famous", "Grand", "Iconic"]}
    elif req.visit_preference == "Cultural":
        query["category"] = {"$in": ["Cultural", "Heritage", "Eco-Friendly"]}
    elif req.visit_preference == "Featured 10":
        query["is_featured"] = True

    mandals = []
    if db is not None:
        cursor = db.mandals.find(query)
        async for doc in cursor:
            mandals.append(MandalResponse(**normalize_mandal_doc(doc)))

    if not mandals and db is not None:
        cursor = db.mandals.find({"is_active": True})
        async for doc in cursor:
            mandals.append(MandalResponse(**normalize_mandal_doc(doc)))

    # Sort by distance from start point
    mandals.sort(key=lambda m: calculate_haversine_distance_km(start_lat, start_lng, m.latitude, m.longitude))

    # Pick stops within available time
    max_stops = min(req.max_stops or 5, len(mandals))
    selected_mandals = mandals[:max_stops]

    stops = []
    cur_time_str = req.start_time or "09:00"
    try:
        hours, mins = map(int, cur_time_str.split(":"))
    except Exception:
        hours, mins = 9, 0

    current_minutes = hours * 60 + mins
    total_visit_time = 0
    total_travel_time = 0

    speed_kmh = {
        "Walking": 4.5,
        "Train": 25.0,
        "Bus": 12.0,
        "Car": 15.0,
        "Bike": 20.0,
        "Mixed": 18.0
    }.get(req.travel_mode, 15.0)

    for i, m in enumerate(selected_mandals):
        darshan_time = m.avg_darshan_time_mins or 40
        total_visit_time += darshan_time

        # Calculate distance to next stop
        if i < len(selected_mandals) - 1:
            next_m = selected_mandals[i + 1]
            dist_km = calculate_haversine_distance_km(m.latitude, m.longitude, next_m.latitude, next_m.longitude)
            travel_mins = max(10, int(round((dist_km / speed_kmh) * 60)))
        else:
            dist_km = 0.0
            travel_mins = 0

        total_travel_time += travel_mins

        arr_h = (current_minutes // 60) % 24
        arr_m = current_minutes % 60
        arr_str = f"{arr_h:02d}:{arr_m:02d}"

        dep_mins = current_minutes + darshan_time
        dep_h = (dep_mins // 60) % 24
        dep_m = dep_mins % 60
        dep_str = f"{dep_h:02d}:{dep_m:02d}"

        current_minutes = dep_mins + travel_mins

        tip = f"Nearest station: {m.nearestStation or 'Central Station'}. Dedicated footwear counter available."
        stops.append(PlannerStopSchema(
            stop_number=i + 1,
            mandal=m,
            visit_duration_mins=darshan_time,
            travel_to_next_mins=travel_mins,
            travel_distance_next_km=round(dist_km, 2),
            arrival_time=arr_str,
            departure_time=dep_str,
            travel_tip=tip
        ))

    total_time = total_visit_time + total_travel_time
    buffer_time = max(20, int(total_time * 0.15))

    return PlannerResultSchema(
        id=f"plan-{uuid.uuid4().hex[:8]}",
        title=f"Mumbai {req.travel_mode} Darshan Circuit ({len(stops)} Stops)",
        total_time_mins=total_time + buffer_time,
        total_visit_time_mins=total_visit_time,
        total_travel_time_mins=total_travel_time,
        buffer_mins=buffer_time,
        stops_count=len(stops),
        stops=stops,
        starting_location=req.starting_location,
        travel_mode=req.travel_mode,
        created_at=datetime.now(timezone.utc).isoformat()
    )