from django.shortcuts import get_object_or_404, render
from django.utils import timezone

from .api_client import WeatherAPIError, update_city_weather
from .models import City, WeatherSnapshot, WorldZone


def dashboard(request):
    """Main dashboard showing all world zones with featured-city weather."""
    zones = WorldZone.objects.prefetch_related('cities__weather_snapshot').all()
    context = {
        'zones': zones,
        'now': timezone.now(),
    }
    return render(request, 'weather/dashboard.html', context)


def zone_detail(request, slug):
    """Detail view for a single world zone showing all its cities and weather."""
    zone = get_object_or_404(WorldZone, slug=slug)
    cities = zone.cities.prefetch_related('weather_snapshot').order_by('-is_featured', 'name')
    context = {
        'zone': zone,
        'cities': cities,
        'now': timezone.now(),
    }
    return render(request, 'weather/zone_detail.html', context)


def refresh_city_weather(request, city_id):
    """Trigger a live weather refresh for a single city (GET is fine for a demo)."""
    from django.http import JsonResponse

    city = get_object_or_404(City, pk=city_id)
    success = update_city_weather(city)

    if success:
        snap = city.weather_snapshot
        return JsonResponse({
            'success': True,
            'temperature_celsius': snap.temperature_celsius,
            'feels_like_celsius': snap.feels_like_celsius,
            'humidity_percent': snap.humidity_percent,
            'wind_speed_ms': snap.wind_speed_ms,
            'description': snap.description,
            'icon_url': snap.icon_url,
        })
    return JsonResponse({'success': False, 'error': 'Could not fetch weather data.'}, status=502)
