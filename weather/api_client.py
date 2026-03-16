"""OpenWeatherMap API client for fetching current weather data."""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'


class WeatherAPIError(Exception):
    """Raised when the weather API returns an unexpected response."""


def fetch_weather(city_name: str, country_code: str) -> dict:
    """
    Fetch current weather for a city from OpenWeatherMap.

    Returns a dict with keys:
        temperature_celsius, feels_like_celsius, humidity_percent,
        wind_speed_ms, description, icon_code

    Raises WeatherAPIError if the request fails or the API key is not set.
    """
    api_key = settings.OPENWEATHERMAP_API_KEY
    if not api_key:
        raise WeatherAPIError(
            'OPENWEATHERMAP_API_KEY is not configured. '
            'Set the environment variable to enable live weather data.'
        )

    params = {
        'q': f'{city_name},{country_code}',
        'appid': api_key,
        'units': 'metric',
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise WeatherAPIError(f'Failed to fetch weather for {city_name}: {exc}') from exc

    data = response.json()

    try:
        return {
            'temperature_celsius': data['main']['temp'],
            'feels_like_celsius': data['main']['feels_like'],
            'humidity_percent': data['main']['humidity'],
            'wind_speed_ms': data['wind']['speed'],
            'description': data['weather'][0]['description'].capitalize(),
            'icon_code': data['weather'][0]['icon'],
        }
    except (KeyError, IndexError) as exc:
        raise WeatherAPIError(f'Unexpected API response format: {exc}') from exc


def update_city_weather(city) -> bool:
    """
    Fetch latest weather for *city* and save it to WeatherSnapshot.

    Returns True on success, False on failure (logs the error).
    """
    from weather.models import WeatherSnapshot  # avoid circular import

    try:
        weather_data = fetch_weather(city.name, city.country_code)
    except WeatherAPIError as exc:
        logger.warning('Could not update weather for %s: %s', city, exc)
        return False

    WeatherSnapshot.objects.update_or_create(
        city=city,
        defaults=weather_data,
    )
    return True
