from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
class LandingViews(View):
    def get(self, request):
        return JsonResponse({
            "message" : "Welcome to the WeatherDash landing page"
        })