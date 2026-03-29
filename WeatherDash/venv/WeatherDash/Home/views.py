from django.shortcuts import render
from django.views import View


class HomeViews(View):
    def get(self,request):
        return render(request, 'Home/Home.html' , {})
