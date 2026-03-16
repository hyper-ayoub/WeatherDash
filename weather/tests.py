"""Tests for the WeatherDash weather application."""

from unittest.mock import MagicMock, patch

from django.test import Client, TestCase
from django.urls import reverse

from .models import City, WeatherSnapshot, WorldZone


class WorldZoneModelTests(TestCase):
    def setUp(self):
        self.zone = WorldZone.objects.create(
            name='Test Zone',
            continent='EU',
            timezone='Europe/London',
            utc_offset=0.0,
            slug='test-zone',
        )

    def test_str_representation(self):
        self.assertIn('Test Zone', str(self.zone))
        self.assertIn('Europe', str(self.zone))

    def test_continent_display(self):
        self.assertEqual(self.zone.get_continent_display(), 'Europe')

    def test_ordering_by_continent_then_name(self):
        WorldZone.objects.create(
            name='Alpha Zone',
            continent='AF',
            timezone='Africa/Cairo',
            utc_offset=2.0,
            slug='alpha-zone',
        )
        zones = list(WorldZone.objects.all())
        # Africa (AF) should come before Europe (EU) alphabetically
        self.assertEqual(zones[0].continent, 'AF')
        self.assertEqual(zones[1].continent, 'EU')


class CityModelTests(TestCase):
    def setUp(self):
        self.zone = WorldZone.objects.create(
            name='Europe',
            continent='EU',
            timezone='Europe/London',
            utc_offset=0.0,
            slug='europe',
        )
        self.city = City.objects.create(
            zone=self.zone,
            name='London',
            country_code='GB',
            latitude=51.5074,
            longitude=-0.1278,
            is_featured=True,
        )

    def test_str_representation(self):
        self.assertEqual(str(self.city), 'London, GB')

    def test_city_belongs_to_zone(self):
        self.assertEqual(self.city.zone, self.zone)

    def test_unique_together_constraint(self):
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            City.objects.create(
                zone=self.zone,
                name='London',
                country_code='GB',
                latitude=51.0,
                longitude=-0.1,
            )


class WeatherSnapshotTests(TestCase):
    def setUp(self):
        self.zone = WorldZone.objects.create(
            name='Asia',
            continent='AS',
            timezone='Asia/Tokyo',
            utc_offset=9.0,
            slug='asia',
        )
        self.city = City.objects.create(
            zone=self.zone,
            name='Tokyo',
            country_code='JP',
            latitude=35.6762,
            longitude=139.6503,
        )
        self.snapshot = WeatherSnapshot.objects.create(
            city=self.city,
            temperature_celsius=22.5,
            feels_like_celsius=21.0,
            humidity_percent=60,
            wind_speed_ms=3.5,
            description='Clear sky',
            icon_code='01d',
        )

    def test_temperature_fahrenheit_conversion(self):
        expected = round(22.5 * 9 / 5 + 32, 1)
        self.assertAlmostEqual(self.snapshot.temperature_fahrenheit, expected)

    def test_temperature_fahrenheit_none_when_celsius_none(self):
        self.snapshot.temperature_celsius = None
        self.assertIsNone(self.snapshot.temperature_fahrenheit)

    def test_icon_url_with_code(self):
        self.assertIn('01d', self.snapshot.icon_url)
        self.assertTrue(self.snapshot.icon_url.startswith('https://'))

    def test_icon_url_empty_when_no_code(self):
        self.snapshot.icon_code = ''
        self.assertEqual(self.snapshot.icon_url, '')

    def test_str_representation(self):
        self.assertIn('Tokyo', str(self.snapshot))


class DashboardViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.zone = WorldZone.objects.create(
            name='North America',
            continent='NA',
            timezone='America/New_York',
            utc_offset=-5.0,
            slug='north-america',
        )

    def test_dashboard_returns_200(self):
        response = self.client.get(reverse('weather:dashboard'))
        self.assertEqual(response.status_code, 200)

    def test_dashboard_uses_correct_template(self):
        response = self.client.get(reverse('weather:dashboard'))
        self.assertTemplateUsed(response, 'weather/dashboard.html')

    def test_dashboard_contains_zones_in_context(self):
        response = self.client.get(reverse('weather:dashboard'))
        self.assertIn('zones', response.context)

    def test_dashboard_shows_zone_name(self):
        response = self.client.get(reverse('weather:dashboard'))
        self.assertContains(response, 'North America')


class ZoneDetailViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.zone = WorldZone.objects.create(
            name='Oceania',
            continent='OC',
            timezone='Australia/Sydney',
            utc_offset=10.0,
            slug='oceania',
        )
        self.city = City.objects.create(
            zone=self.zone,
            name='Sydney',
            country_code='AU',
            latitude=-33.8688,
            longitude=151.2093,
            is_featured=True,
        )

    def test_zone_detail_returns_200(self):
        response = self.client.get(reverse('weather:zone_detail', kwargs={'slug': 'oceania'}))
        self.assertEqual(response.status_code, 200)

    def test_zone_detail_returns_404_for_unknown_slug(self):
        response = self.client.get(reverse('weather:zone_detail', kwargs={'slug': 'unknown-zone'}))
        self.assertEqual(response.status_code, 404)

    def test_zone_detail_uses_correct_template(self):
        response = self.client.get(reverse('weather:zone_detail', kwargs={'slug': 'oceania'}))
        self.assertTemplateUsed(response, 'weather/zone_detail.html')

    def test_zone_detail_shows_city(self):
        response = self.client.get(reverse('weather:zone_detail', kwargs={'slug': 'oceania'}))
        self.assertContains(response, 'Sydney')


class RefreshCityWeatherViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.zone = WorldZone.objects.create(
            name='Europe',
            continent='EU',
            timezone='Europe/London',
            utc_offset=0.0,
            slug='europe',
        )
        self.city = City.objects.create(
            zone=self.zone,
            name='Paris',
            country_code='FR',
            latitude=48.8566,
            longitude=2.3522,
        )

    def test_refresh_returns_404_for_unknown_city(self):
        response = self.client.get(reverse('weather:refresh_city_weather', kwargs={'city_id': 9999}))
        self.assertEqual(response.status_code, 404)

    @patch('weather.views.update_city_weather')
    def test_refresh_returns_success_json(self, mock_update):
        mock_update.return_value = True
        WeatherSnapshot.objects.create(
            city=self.city,
            temperature_celsius=15.0,
            feels_like_celsius=14.0,
            humidity_percent=70,
            wind_speed_ms=2.0,
            description='Partly cloudy',
            icon_code='02d',
        )
        url = reverse('weather:refresh_city_weather', kwargs={'city_id': self.city.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['temperature_celsius'], 15.0)

    @patch('weather.views.update_city_weather')
    def test_refresh_returns_502_on_failure(self, mock_update):
        mock_update.return_value = False
        url = reverse('weather:refresh_city_weather', kwargs={'city_id': self.city.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 502)
        data = response.json()
        self.assertFalse(data['success'])


class APIClientTests(TestCase):
    @patch('weather.api_client.requests.get')
    def test_fetch_weather_success(self, mock_get):
        from .api_client import fetch_weather
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'main': {'temp': 20.0, 'feels_like': 19.0, 'humidity': 65},
            'wind': {'speed': 3.0},
            'weather': [{'description': 'clear sky', 'icon': '01d'}],
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        with self.settings(OPENWEATHERMAP_API_KEY='test-key'):
            result = fetch_weather('London', 'GB')

        self.assertEqual(result['temperature_celsius'], 20.0)
        self.assertEqual(result['description'], 'Clear sky')
        self.assertEqual(result['icon_code'], '01d')

    def test_fetch_weather_raises_without_api_key(self):
        from .api_client import WeatherAPIError, fetch_weather
        with self.settings(OPENWEATHERMAP_API_KEY=''):
            with self.assertRaises(WeatherAPIError):
                fetch_weather('London', 'GB')

    @patch('weather.api_client.requests.get')
    def test_fetch_weather_raises_on_network_error(self, mock_get):
        import requests as req
        from .api_client import WeatherAPIError, fetch_weather
        mock_get.side_effect = req.RequestException('timeout')
        with self.settings(OPENWEATHERMAP_API_KEY='test-key'):
            with self.assertRaises(WeatherAPIError):
                fetch_weather('London', 'GB')

    @patch('weather.api_client.fetch_weather')
    def test_update_city_weather_success(self, mock_fetch):
        from .api_client import update_city_weather
        zone = WorldZone.objects.create(
            name='Test',
            continent='EU',
            timezone='Europe/London',
            utc_offset=0.0,
            slug='test-api',
        )
        city = City.objects.create(
            zone=zone,
            name='London',
            country_code='GB',
            latitude=51.5,
            longitude=-0.1,
        )
        mock_fetch.return_value = {
            'temperature_celsius': 18.0,
            'feels_like_celsius': 17.0,
            'humidity_percent': 75,
            'wind_speed_ms': 4.0,
            'description': 'Overcast',
            'icon_code': '04d',
        }
        result = update_city_weather(city)
        self.assertTrue(result)
        snap = WeatherSnapshot.objects.get(city=city)
        self.assertEqual(snap.temperature_celsius, 18.0)


class SeedZonesCommandTests(TestCase):
    def test_seed_zones_creates_data(self):
        from django.core.management import call_command
        call_command('seed_zones', verbosity=0)
        self.assertGreater(WorldZone.objects.count(), 0)
        self.assertGreater(City.objects.count(), 0)

    def test_seed_zones_idempotent(self):
        from django.core.management import call_command
        call_command('seed_zones', verbosity=0)
        zone_count = WorldZone.objects.count()
        city_count = City.objects.count()
        call_command('seed_zones', verbosity=0)
        self.assertEqual(WorldZone.objects.count(), zone_count)
        self.assertEqual(City.objects.count(), city_count)

    def test_seed_zones_clear_flag(self):
        from django.core.management import call_command
        call_command('seed_zones', verbosity=0)
        call_command('seed_zones', '--clear', verbosity=0)
        self.assertGreater(WorldZone.objects.count(), 0)
