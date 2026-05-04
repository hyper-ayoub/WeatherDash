import requests
from django.conf import settings

def get_weather_station(query):
    try:
        # Géocodage avec Nominatim
        geo_url = "https://nominatim.openstreetmap.org/search"
        geo_res = requests.get(
            geo_url,params={"q": query, "format": "json", "limit": 1},headers={"User-Agent": "antarctica-app"},timeout=2).json()

        if not geo_res:
            return {"error": f"Station '{query}' introuvable"}

        place = geo_res[0]
        lat = float(place["lat"])
        lon = float(place["lon"])
        name = place.get("display_name", query)
        country = place.get("country", "Antarctica")

    except Exception as e:
        return {"error": f"Géocodage impossible: {str(e)}"}

    # Météo actuelle via OpenWeatherMap
    weather_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat,"lon": lon,"appid": settings.OPENWEATHER_API_KEY,"units": "metric"}
    weather = requests.get(weather_url, params=params, timeout=10).json()

    # Prévisions 7 jours via Open‑Meteo (uniquement températures)
    forecast_url = "https://api.open-meteo.com/v1/forecast"
    params_fc = {"latitude": lat,"longitude": lon,"daily": "temperature_2m_max,temperature_2m_min","timezone": "auto"}
    forecast = requests.get(forecast_url, params=params_fc, timeout=10).json()

    # Transformer le format températures + condition OpenWeatherMap
    daily_forecast = []
    for i in range(len(forecast["daily"]["time"])):
        daily_forecast.append({
            "temp": {
                "min": forecast["daily"]["temperature_2m_min"][i],
                "max": forecast["daily"]["temperature_2m_max"][i]
            },
            "weather": [{
                "description": weather["weather"][0]["description"]
            }]
        })

    return {"region": "Antarctica","name": name, "country": country, "location": f"{name}, {country}","coord": {"lat": lat, "lon": lon},
        "weather": {
            "temperature": weather["main"]["temp"],
            "feels_like": weather["main"]["feels_like"],
            "temp_min": weather["main"]["temp_min"],
            "temp_max": weather["main"]["temp_max"],
            "humidity": weather["main"]["humidity"],
            "pressure": weather["main"]["pressure"],
            "visibility": weather.get("visibility", 0) / 1000,
            "windspeed": round(weather["wind"]["speed"] * 3.6),
            "condition": weather["weather"][0]["description"]
        },
        "forecast": daily_forecast[:7]
    }
