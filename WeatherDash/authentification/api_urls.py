from django.urls import path

from .views import api_logout, api_me, api_signin, api_signup

urlpatterns = [
    path('signup/', api_signup, name='api-signup'),
    path('signin/', api_signin, name='api-signin'),
    path('logout/', api_logout, name='api-logout'),
    path('me/', api_me, name='api-me'),
]