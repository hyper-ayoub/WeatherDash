from django.urls import path

from .views import LandingViews

urlpatterns = [
    path('', LandingViews.as_view(), name ='landing_page'),
]