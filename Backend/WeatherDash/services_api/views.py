from django.views import View
from django.http import JsonResponse
from .contry_convert import detect_region
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings

from .weather_service import get_weather, get_forecast
from .unsplash_service import get_city_image
from .windy_service import get_windy_data, get_windy_embed_url
from Home.models import Region, Ville
from .stations import get_weather_station

class ServicesViews(View):
    @method_decorator(cache_page(60 * 15))
    def get(self, request):
        """ city """
        city = request.GET.get("city", "")
        if not city:
            return JsonResponse({"error": "Veuillez fournir une ville"}, status=400)

        """ weather """
        weather = get_weather(city)
        if weather.get("cod") != 200:
            return JsonResponse({"error": f"Ville '{city}' introuvable"}, status=404)

        """ convert country → region """
        country_code = weather["sys"]["country"]
        region_name  = detect_region(country_code)
        if region_name == "Unknown region for this country":
            return JsonResponse({"error": f"Ville '{city}' introuvable, invalide Region"}, status=404)

        """ verify DB region """
        region_obj = Region.objects.filter(nom=region_name).first()
        if not region_obj:
            return JsonResponse({"error": "Region missing in database"}, status=404)

        """ save ville sans répétition + insensible à la casse """
        if not Ville.objects.filter(nom__iexact=weather["name"], pays=weather["sys"]["country"]).exists():
            Ville.objects.create(nom=weather["name"], pays=weather["sys"]["country"], region=region_obj)

        """ coords """
        lat = weather["coord"]["lat"]
        lon = weather["coord"]["lon"]

        """ forecast , image , windy_data , windy_embed """
        forecast    = get_forecast(city)
        image       = get_city_image(city)
        windy_data  = get_windy_data(lat, lon)
        windy_embed = get_windy_embed_url(lat, lon)

        """ response """
        return JsonResponse({
            "region":      region_name,
            "weather":     weather,
            "forecast":    forecast,
            "image":       image,
            "windy_data":  windy_data,
            "windy_embed": windy_embed
        })

class AntarcticaViews(View):
    @method_decorator(cache_page(60 * 15))
    def get(self, request):
        """ station """
        station = request.GET.get("station", "")
        if not station:
            return JsonResponse({"error": "Veuillez fournir une station"}, status=400)

        """ weather station """
        data = get_weather_station(station)
        if "error" in data:
            return JsonResponse(data, status=404)

        """ verify DB region """
        region_obj = Region.objects.filter(nom="Antarctica").first()
        if not region_obj:
            return JsonResponse({"error": "Region missing in database"}, status=404)

        """ save station sans répétition  """
        if not Ville.objects.filter(nom__iexact=data["name"], pays=data["country"]).exists():
            Ville.objects.create(nom=data["name"], pays=data["country"], region=region_obj)

        """ coords """
        lat = data["coord"]["lat"]
        lon = data["coord"]["lon"]

        """ response """
        return JsonResponse({
            "region":      "Antarctica",
            "location":    f"{data['name']} ({data['country']})",
            "weather":     data["weather"],
            "forecast":    data["forecast"],
            "image":       get_city_image(data["name"]),
            "windy_data":  get_windy_data(lat, lon),
            "windy_embed": get_windy_embed_url(lat, lon),
        })