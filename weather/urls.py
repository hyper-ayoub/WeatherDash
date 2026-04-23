from django.urls import path

from . import views

app_name = 'weather'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('zone/<slug:slug>/', views.zone_detail, name='zone_detail'),
    path('city/<int:city_id>/refresh/', views.refresh_city_weather, name='refresh_city_weather'),
]
