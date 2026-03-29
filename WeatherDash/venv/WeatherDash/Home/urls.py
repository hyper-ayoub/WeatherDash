from django.urls import path
from .views import HomeViews

urlpatterns = [
    path('', HomeViews.as_view(), name ='Home'),
]