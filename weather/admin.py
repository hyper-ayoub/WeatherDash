from django.contrib import admin

from .models import City, WeatherSnapshot, WorldZone


class CityInline(admin.TabularInline):
    model = City
    extra = 1
    fields = ('name', 'country_code', 'latitude', 'longitude', 'is_featured')


@admin.register(WorldZone)
class WorldZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'continent', 'timezone', 'utc_offset', 'slug')
    list_filter = ('continent',)
    search_fields = ('name', 'timezone')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CityInline]


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_code', 'zone', 'latitude', 'longitude', 'is_featured')
    list_filter = ('zone', 'is_featured', 'country_code')
    search_fields = ('name', 'country_code')


@admin.register(WeatherSnapshot)
class WeatherSnapshotAdmin(admin.ModelAdmin):
    list_display = ('city', 'temperature_celsius', 'description', 'fetched_at')
    readonly_fields = ('fetched_at',)
