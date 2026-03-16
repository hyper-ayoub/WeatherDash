from django.db import models


class WorldZone(models.Model):
    """Represents a major global geographic/timezone zone."""

    CONTINENT_CHOICES = [
        ('AF', 'Africa'),
        ('AN', 'Antarctica'),
        ('AS', 'Asia'),
        ('EU', 'Europe'),
        ('NA', 'North America'),
        ('OC', 'Oceania'),
        ('SA', 'South America'),
    ]

    name = models.CharField(max_length=100, unique=True)
    continent = models.CharField(max_length=2, choices=CONTINENT_CHOICES)
    description = models.TextField(blank=True)
    timezone = models.CharField(
        max_length=50,
        help_text='Primary IANA timezone identifier, e.g. America/New_York',
    )
    utc_offset = models.FloatField(
        help_text='UTC offset in hours (e.g. -5.0 for UTC-5)',
    )
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['continent', 'name']

    def __str__(self):
        return f'{self.name} ({self.get_continent_display()})'


class City(models.Model):
    """Represents a city within a world zone for weather tracking."""

    zone = models.ForeignKey(
        WorldZone,
        on_delete=models.CASCADE,
        related_name='cities',
    )
    name = models.CharField(max_length=100)
    country_code = models.CharField(
        max_length=2,
        help_text='ISO 3166-1 alpha-2 country code',
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_featured = models.BooleanField(
        default=False,
        help_text='Show this city prominently on the dashboard',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'cities'
        unique_together = [['name', 'country_code']]

    def __str__(self):
        return f'{self.name}, {self.country_code}'


class WeatherSnapshot(models.Model):
    """Cached weather data for a city, refreshed periodically."""

    city = models.OneToOneField(
        City,
        on_delete=models.CASCADE,
        related_name='weather_snapshot',
    )
    temperature_celsius = models.FloatField(null=True, blank=True)
    feels_like_celsius = models.FloatField(null=True, blank=True)
    humidity_percent = models.IntegerField(null=True, blank=True)
    wind_speed_ms = models.FloatField(null=True, blank=True)
    description = models.CharField(max_length=200, blank=True)
    icon_code = models.CharField(max_length=10, blank=True)
    fetched_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Weather for {self.city} at {self.fetched_at}'

    @property
    def temperature_fahrenheit(self):
        if self.temperature_celsius is None:
            return None
        return round(self.temperature_celsius * 9 / 5 + 32, 1)

    @property
    def icon_url(self):
        if self.icon_code:
            return f'https://openweathermap.org/img/wn/{self.icon_code}@2x.png'
        return ''
