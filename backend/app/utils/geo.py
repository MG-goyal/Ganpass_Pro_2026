import math
from typing import Tuple

def calculate_haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the Earth
    in meters using the Haversine formula.
    """
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return distance

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance in kilometers.
    """
    return calculate_haversine_distance_meters(lat1, lon1, lat2, lon2) / 1000.0

def is_within_checkin_radius(user_lat: float, user_lng: float, mandal_lat: float, mandal_lng: float, max_radius_meters: float = 150.0) -> Tuple[bool, float]:
    """
    Checks if user is within the required check-in radius of the mandal.
    Returns (is_within, actual_distance_meters).
    """
    dist_meters = calculate_haversine_distance_meters(user_lat, user_lng, mandal_lat, mandal_lng)
    return (dist_meters <= max_radius_meters, round(dist_meters, 1))
