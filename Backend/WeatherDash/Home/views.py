from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views import View

@method_decorator(login_required, name='dispatch')
class HomeViews(View):
    def get(self, request):
        return JsonResponse({
            "message": f"Welcome { request.user.first_name}"
        })