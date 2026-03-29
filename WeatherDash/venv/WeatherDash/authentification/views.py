from django.shortcuts import render
from django.views import View


class AuthentificationViews(View):
    def get(self,request):
        return render(request, 'authentification/authentification.html' , {})


