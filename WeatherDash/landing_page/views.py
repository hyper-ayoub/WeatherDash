from django.shortcuts import render
from django.views import View

class LandingViews(View):
    def get(self, request):
        return render(request, 'landing_page/landing.html', {})