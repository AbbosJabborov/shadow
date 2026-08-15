from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_health(request):
    return JsonResponse({
        "status": "online",
        "service": "Shadow Economy Radar API",
        "version": "1.0.0"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_health, name='health'),
    path('api/', include('radar.urls')),
]
