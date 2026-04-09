"""Management command to seed the database with global world zones and cities."""

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from weather.models import City, WorldZone

ZONES_DATA = [
    {
        'name': 'North America',
        'continent': 'NA',
        'description': 'The northern part of the Americas, spanning from the Arctic to the tropics.',
        'timezone': 'America/New_York',
        'utc_offset': -5.0,
        'cities': [
            {'name': 'New York', 'country_code': 'US', 'lat': 40.7128, 'lon': -74.0060, 'featured': True},
            {'name': 'Los Angeles', 'country_code': 'US', 'lat': 34.0522, 'lon': -118.2437, 'featured': True},
            {'name': 'Chicago', 'country_code': 'US', 'lat': 41.8781, 'lon': -87.6298, 'featured': False},
            {'name': 'Toronto', 'country_code': 'CA', 'lat': 43.7001, 'lon': -79.4163, 'featured': True},
            {'name': 'Mexico City', 'country_code': 'MX', 'lat': 19.4326, 'lon': -99.1332, 'featured': False},
        ],
    },
    {
        'name': 'South America',
        'continent': 'SA',
        'description': 'South American continent with diverse climates from equatorial to subpolar.',
        'timezone': 'America/Sao_Paulo',
        'utc_offset': -3.0,
        'cities': [
            {'name': 'Sao Paulo', 'country_code': 'BR', 'lat': -23.5505, 'lon': -46.6333, 'featured': True},
            {'name': 'Buenos Aires', 'country_code': 'AR', 'lat': -34.6037, 'lon': -58.3816, 'featured': True},
            {'name': 'Lima', 'country_code': 'PE', 'lat': -12.0464, 'lon': -77.0428, 'featured': False},
            {'name': 'Bogota', 'country_code': 'CO', 'lat': 4.7110, 'lon': -74.0721, 'featured': False},
            {'name': 'Santiago', 'country_code': 'CL', 'lat': -33.4489, 'lon': -70.6693, 'featured': False},
        ],
    },
    {
        'name': 'Western Europe',
        'continent': 'EU',
        'description': 'Western Europe covering the Atlantic coast to central European plains.',
        'timezone': 'Europe/London',
        'utc_offset': 0.0,
        'cities': [
            {'name': 'London', 'country_code': 'GB', 'lat': 51.5074, 'lon': -0.1278, 'featured': True},
            {'name': 'Paris', 'country_code': 'FR', 'lat': 48.8566, 'lon': 2.3522, 'featured': True},
            {'name': 'Madrid', 'country_code': 'ES', 'lat': 40.4168, 'lon': -3.7038, 'featured': False},
            {'name': 'Amsterdam', 'country_code': 'NL', 'lat': 52.3676, 'lon': 4.9041, 'featured': False},
            {'name': 'Berlin', 'country_code': 'DE', 'lat': 52.5200, 'lon': 13.4050, 'featured': True},
        ],
    },
    {
        'name': 'Eastern Europe',
        'continent': 'EU',
        'description': 'Eastern Europe stretching from the Baltic Sea to the Black Sea.',
        'timezone': 'Europe/Moscow',
        'utc_offset': 3.0,
        'cities': [
            {'name': 'Moscow', 'country_code': 'RU', 'lat': 55.7558, 'lon': 37.6176, 'featured': True},
            {'name': 'Warsaw', 'country_code': 'PL', 'lat': 52.2297, 'lon': 21.0122, 'featured': False},
            {'name': 'Kiev', 'country_code': 'UA', 'lat': 50.4501, 'lon': 30.5234, 'featured': False},
            {'name': 'Bucharest', 'country_code': 'RO', 'lat': 44.4268, 'lon': 26.1025, 'featured': False},
            {'name': 'Istanbul', 'country_code': 'TR', 'lat': 41.0082, 'lon': 28.9784, 'featured': True},
        ],
    },
    {
        'name': 'Middle East & Central Asia',
        'continent': 'AS',
        'description': 'The Middle East and Central Asia, bridging Europe, Africa, and Asia.',
        'timezone': 'Asia/Dubai',
        'utc_offset': 4.0,
        'cities': [
            {'name': 'Dubai', 'country_code': 'AE', 'lat': 25.2048, 'lon': 55.2708, 'featured': True},
            {'name': 'Riyadh', 'country_code': 'SA', 'lat': 24.7136, 'lon': 46.6753, 'featured': False},
            {'name': 'Tehran', 'country_code': 'IR', 'lat': 35.6892, 'lon': 51.3890, 'featured': False},
            {'name': 'Karachi', 'country_code': 'PK', 'lat': 24.8607, 'lon': 67.0011, 'featured': True},
            {'name': 'Baghdad', 'country_code': 'IQ', 'lat': 33.3152, 'lon': 44.3661, 'featured': False},
        ],
    },
    {
        'name': 'South Asia',
        'continent': 'AS',
        'description': 'South Asia including the Indian subcontinent and surrounding nations.',
        'timezone': 'Asia/Kolkata',
        'utc_offset': 5.5,
        'cities': [
            {'name': 'Mumbai', 'country_code': 'IN', 'lat': 19.0760, 'lon': 72.8777, 'featured': True},
            {'name': 'Delhi', 'country_code': 'IN', 'lat': 28.7041, 'lon': 77.1025, 'featured': True},
            {'name': 'Dhaka', 'country_code': 'BD', 'lat': 23.8103, 'lon': 90.4125, 'featured': False},
            {'name': 'Colombo', 'country_code': 'LK', 'lat': 6.9271, 'lon': 79.8612, 'featured': False},
            {'name': 'Kathmandu', 'country_code': 'NP', 'lat': 27.7172, 'lon': 85.3240, 'featured': False},
        ],
    },
    {
        'name': 'East Asia',
        'continent': 'AS',
        'description': 'East Asia including China, Japan, Korea and surrounding regions.',
        'timezone': 'Asia/Tokyo',
        'utc_offset': 9.0,
        'cities': [
            {'name': 'Tokyo', 'country_code': 'JP', 'lat': 35.6762, 'lon': 139.6503, 'featured': True},
            {'name': 'Beijing', 'country_code': 'CN', 'lat': 39.9042, 'lon': 116.4074, 'featured': True},
            {'name': 'Seoul', 'country_code': 'KR', 'lat': 37.5665, 'lon': 126.9780, 'featured': True},
            {'name': 'Shanghai', 'country_code': 'CN', 'lat': 31.2304, 'lon': 121.4737, 'featured': False},
            {'name': 'Hong Kong', 'country_code': 'HK', 'lat': 22.3193, 'lon': 114.1694, 'featured': False},
        ],
    },
    {
        'name': 'Southeast Asia',
        'continent': 'AS',
        'description': 'Southeast Asia, a region known for tropical climates and island nations.',
        'timezone': 'Asia/Singapore',
        'utc_offset': 8.0,
        'cities': [
            {'name': 'Singapore', 'country_code': 'SG', 'lat': 1.3521, 'lon': 103.8198, 'featured': True},
            {'name': 'Bangkok', 'country_code': 'TH', 'lat': 13.7563, 'lon': 100.5018, 'featured': True},
            {'name': 'Jakarta', 'country_code': 'ID', 'lat': -6.2088, 'lon': 106.8456, 'featured': False},
            {'name': 'Hanoi', 'country_code': 'VN', 'lat': 21.0285, 'lon': 105.8542, 'featured': False},
            {'name': 'Manila', 'country_code': 'PH', 'lat': 14.5995, 'lon': 120.9842, 'featured': False},
        ],
    },
    {
        'name': 'Africa',
        'continent': 'AF',
        'description': 'The African continent, spanning the Sahara, tropics, and southern regions.',
        'timezone': 'Africa/Cairo',
        'utc_offset': 2.0,
        'cities': [
            {'name': 'Cairo', 'country_code': 'EG', 'lat': 30.0444, 'lon': 31.2357, 'featured': True},
            {'name': 'Lagos', 'country_code': 'NG', 'lat': 6.5244, 'lon': 3.3792, 'featured': True},
            {'name': 'Nairobi', 'country_code': 'KE', 'lat': -1.2921, 'lon': 36.8219, 'featured': False},
            {'name': 'Johannesburg', 'country_code': 'ZA', 'lat': -26.2041, 'lon': 28.0473, 'featured': True},
            {'name': 'Casablanca', 'country_code': 'MA', 'lat': 33.5731, 'lon': -7.5898, 'featured': False},
        ],
    },
    {
        'name': 'Oceania',
        'continent': 'OC',
        'description': 'Oceania including Australia, New Zealand and Pacific island nations.',
        'timezone': 'Australia/Sydney',
        'utc_offset': 10.0,
        'cities': [
            {'name': 'Sydney', 'country_code': 'AU', 'lat': -33.8688, 'lon': 151.2093, 'featured': True},
            {'name': 'Melbourne', 'country_code': 'AU', 'lat': -37.8136, 'lon': 144.9631, 'featured': False},
            {'name': 'Auckland', 'country_code': 'NZ', 'lat': -36.8509, 'lon': 174.7645, 'featured': True},
            {'name': 'Perth', 'country_code': 'AU', 'lat': -31.9505, 'lon': 115.8605, 'featured': False},
            {'name': 'Brisbane', 'country_code': 'AU', 'lat': -27.4698, 'lon': 153.0251, 'featured': False},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with global world zones and representative cities.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing zones and cities before seeding.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            WorldZone.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing zone data.'))

        created_zones = 0
        created_cities = 0

        for zone_data in ZONES_DATA:
            zone_data = dict(zone_data)  # shallow copy to avoid mutating the module-level constant
            cities_data = zone_data.pop('cities')
            slug = slugify(zone_data['name'])

            zone, zone_created = WorldZone.objects.get_or_create(
                slug=slug,
                defaults={**zone_data, 'slug': slug},
            )
            if zone_created:
                created_zones += 1
                self.stdout.write(f'  Created zone: {zone}')

            for city_data in cities_data:
                city, city_created = City.objects.get_or_create(
                    name=city_data['name'],
                    country_code=city_data['country_code'],
                    defaults={
                        'zone': zone,
                        'latitude': city_data['lat'],
                        'longitude': city_data['lon'],
                        'is_featured': city_data['featured'],
                    },
                )
                if city_created:
                    created_cities += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded {created_zones} zones and {created_cities} cities successfully.'
            )
        )
