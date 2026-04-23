import json
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

""" Sigunp """
@method_decorator(csrf_exempt, name='dispatch')
class SignupView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        # verification
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "email already exists"}, status=400)
        if not username or not password or not email:
            return JsonResponse({"error": "All fields required"}, status=400)
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        return JsonResponse({
            "message": "Account created successfully",
            "username": user.username
        })


""" Sigin """
@method_decorator(csrf_exempt, name='dispatch')
class SigninView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        # optional: login with email 
        if email:
            user_obj = User.objects.filter(email=email).first()
            if user_obj:
                username = user_obj.username
        # optional: login with username by default
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({
                "message": "Login successful",
                "username": user.username
            })
        else:
             return JsonResponse({
            "error": "Invalid credentials"
        }, status=400)

""" Logout """
@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({
            "message": "Logged out successfully",
            "username": user.username
        })