import requests
from django.conf import settings

def get_city_image(city):
    """
    Unsplash - Image de la ville
    Doc: https://unsplash.com/documentation#search-photos

    """
    url = "https://api.unsplash.com/search/photos"
    params = {"query":f"{city} city", "client_id":settings.UNSPLASH_API_KEY, "per_page":1, "orientation":"landscape"}
    try:
         response = requests.get(url, params=params, timeout=2)
         data = response.json()
         if data.get("results"):
             return data["results"][0]["urls"]["raw"]
        
    except Exception :
            return ""