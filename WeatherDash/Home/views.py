from django.http import JsonResponse


def api_home(request):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'detail': 'Unauthenticated'}, status=401)

    zones = [
        {'name': 'Africa', 'metric': '31°C', 'summary': 'Dry and bright across the north.'},
        {'name': 'Europe', 'metric': '18°C', 'summary': 'Cool fronts moving east.'},
        {'name': 'North America', 'metric': '22°C', 'summary': 'Mixed storm bands across the interior.'},
        {'name': 'South America', 'metric': '27°C', 'summary': 'Warm coastal humidity.'},
        {'name': 'Middle East', 'metric': '39°C', 'summary': 'Severe heat remains dominant.'},
        {'name': 'South Asia', 'metric': '33°C', 'summary': 'Monsoon pressure building.'},
    ]

    return JsonResponse({
        'ok': True,
        'user': {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'username': request.user.username,
        },
        'stats': {
            'zones': 11,
            'alerts': 4,
            'coverage': 'Global',
        },
        'zones': zones,
    })
