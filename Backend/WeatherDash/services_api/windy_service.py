import requests
from django.conf import settings

def get_windy_data(lat, lon):
    """
    Windy Point Forecast API
    Doc: https://api.windy.com/point-forecast/docs
    """
    url = "https://api.windy.com/api/point-forecast/v2"
    body = {"lat": lat, "lon": lon, "model": "gfs", "parameters": ["wind", "temp", "precip", "pressure"], "levels": ["surface"], "key": settings.WINDY_API_KEY}
    try:
        response = requests.post(url, json=body)
        return response.json()
    except Exception:
        return ""
def get_windy_embed_url(lat, lon):
    """
    Windy Embed URL
    Doc: https://windy.com/embed
    """
    params = f"lat={lat}&lon={lon}&zoom=5&level=surface&overlay=wind"
    return f"https://embed.windy.com/embed2.html?{params}"