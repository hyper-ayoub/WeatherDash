from django.urls import path
from .views import ServicesViews, AntarcticaViews 

urlpatterns = [
    path("services/", ServicesViews.as_view(), name="services"),
    path("antarctica/", AntarcticaViews.as_view(), name="antarctica"),

]
