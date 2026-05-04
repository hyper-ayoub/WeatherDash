import requests
from django.conf import settings

def get_weather(city):
    """
    OpenWeatherMap - Météo actuelle
    Doc: https://openweathermap.org/current
    """
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric", "lang": "en"}
    try:
        response = requests.get(url, params=params, timeout=2)
        return response.json()
    except Exception:
        return {}

def get_forecast(city):
    """
    OpenWeatherMap - Prévisions 7 jours
    Doc: https://openweathermap.org/forecast5
    """
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {"q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric", "lang": "en", "cnt": 7}
    try:
        response = requests.get(url, params=params, timeout=2)
        return response.json()
    except Exception:
        return ""