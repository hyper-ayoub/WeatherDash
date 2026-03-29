from django.urls import path
from .views import AuthentificationViews

urlpatterns = [
    path('', AuthentificationViews.as_view(), name ='authentification'),
]