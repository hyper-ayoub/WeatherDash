import json

from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
    }


def _load_payload(request):
    if request.content_type == 'application/json':
        return json.loads(request.body or '{}')
    return request.POST


@csrf_exempt
def api_signup(request):
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'detail': 'Method not allowed'}, status=405)

    payload = _load_payload(request)
    form = UserCreationForm(payload)
    if not form.is_valid():
        return JsonResponse({'ok': False, 'errors': form.errors}, status=400)

    user = form.save()
    user.first_name = payload.get('first_name', '')
    user.last_name = payload.get('last_name', '')
    user.email = payload.get('email', '')
    user.save()
    return JsonResponse({'ok': True, 'user': _user_payload(user)}, status=201)


@csrf_exempt
def api_signin(request):
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'detail': 'Method not allowed'}, status=405)

    payload = _load_payload(request)
    username = payload.get('username', '')
    password = payload.get('password', '')

    try:
        username = User.objects.get(email=username).username
    except User.DoesNotExist:
        pass

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'ok': False, 'detail': 'Invalid credentials'}, status=400)

    login(request, user)
    return JsonResponse({'ok': True, 'user': _user_payload(user)})


@csrf_exempt
def api_logout(request):
    if request.method not in {'POST', 'GET'}:
        return JsonResponse({'ok': False, 'detail': 'Method not allowed'}, status=405)

    logout(request)
    return JsonResponse({'ok': True})


def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'detail': 'Unauthenticated'}, status=401)

    return JsonResponse({'ok': True, 'user': _user_payload(request.user)})
