**Project Audit — WeatherDash**

Summary
- **Scope**: Backend Django apps (`landing_page`, `authentification`, `Home`, `services_api`) and Frontend React app (`Frontend/src`).
- **Goal**: enumerate routes, functions, API calls, models and provide prioritized improvement suggestions.

Backend: routes & views
- `GET /` -> `landing_page.views.LandingViews.get`: simple JSON welcome message.
- `GET /api/landing/` -> same as above (duplicate include).
- `POST /api/auth/signin/` -> `authentification.views.SigninView.post`: authenticates via `authenticate()`; accepts `username` or `email`.
- `POST /api/auth/signup/` -> `authentification.views.SignupView.post`: creates `User` via `create_user()`.
- `POST /api/auth/logout/` -> `authentification.views.LogoutView.post`: calls `logout()` but currently references undefined `user` when returning response (bug).
- `GET /api/home/` -> `Home.views.HomeViews.get`: protected with `login_required`, returns a small welcome JSON.
- Service endpoints (from `services_api.urls`):
  - `GET /api/services/` -> `ServicesViews.get` (expects `?city=<name>`)
  - `GET /api/antarctica/` -> `AntarcticaViews.get` (expects `?station=<name>`)
  - *Note*: `services_api.urls` is included twice in root `urls.py` (`path('api/services/', include(...))` and `path('api/', include(...))`) producing duplicate and inconsistent route variants (e.g., `/api/services/` and `/api/services/services/`).

Backend: key functions & modules
- `services_api/weather_service.py`: `get_weather(city)`, `get_forecast(city)` — calls OpenWeatherMap (requests, short timeouts, broad excepts returning empty values).
- `services_api/unsplash_service.py`: `get_city_image(city)` — queries Unsplash, returns `urls.raw`.
- `services_api/windy_service.py`: `get_windy_data(lat, lon)`, `get_windy_embed_url(lat, lon)` — uses Windy API and embed URL.
- `services_api/stations.py`: `get_weather_station(query)` — Nominatim geocoding, OpenWeatherMap current weather, Open‑Meteo forecast; formats result.
- `services_api/contry_convert.py`: `detect_region(country)` — maps some codes manually and uses `pycountry_convert`. Contains a stray call `detect_region("paris")` at import time (bug).

Backend: models
- `Home.models.Region` (`nom`)
- `Home.models.Ville` (`region` FK, `nom`, `pays`).

Frontend: structure & API usage
- `Frontend/src/axios_service/axios.jsx`: axios instance with `baseURL: http://127.0.0.1:8000/api` and `withCredentials: true`.
- `Signin.jsx` -> posts to `/auth/signin/` using axios; stores returned object in `localStorage.user` and navigates to `/home`.
- `Signup.jsx` -> posts to `/auth/signup/` using axios and navigates to `/signin`.
- `Layout.jsx` -> search input: on Enter calls either `/api/services/?city=...` or `/api/antarctica/?station=...` using `fetch` and stores `weatherData_<region>` in `localStorage`, then routes to region pages.
- `Home.jsx` -> on mount uses browser geolocation, reverse geocodes with Nominatim then calls `http://127.0.0.1:8000/api/services/?city=...` via `fetch` to populate dashboard.
- Region pages under `Components/region/*` read `weatherData_<Region>` from `localStorage` and render UI; they rely on that shared localStorage contract and `cityChanged` event.

Testing / CI
- Tests files exist but are empty (`tests.py` placeholders). No automated tests or CI present.

Immediate bugs & correctness issues (high priority)
- `authentification.views.LogoutView.post` returns `username: user.username` but `user` is undefined; triggers NameError.
- `services_api/contry_convert.py` calls `detect_region("paris")` at import time; this executes on import and is unintended.
- Duplicate URL includes in `WeatherDash/urls.py` create multiple, inconsistent routes. This is likely accidental and can cause confusion.
- CSRF: authentication views are decorated with `csrf_exempt`. With `withCredentials: true` on axios this suggests cookie-session auth; CSRF should be handled correctly rather than exempting endpoints globally.

Security & configuration issues (high priority)
- Secrets/keys: services read `settings.OPENWEATHER_API_KEY`, `WINDY_API_KEY`, `UNSPLASH_API_KEY` — ensure keys are read from environment, not committed to repo.
- HTTP vs HTTPS: axios `baseURL` points to `http://127.0.0.1:8000` — make base URL configurable via env and use HTTPS in production.
- Session auth + CSRF: either implement proper CSRF tokens (Django's `csrf` framework) for cookie sessions, or adopt token-based auth (JWT) for an API consumed by SPA.
- Rate limiting & abuse protection: external endpoints (Nominatim, OpenWeather) can be rate-limited; add server-side caching, request throttling and backoff/retries.

Reliability & robustness (medium priority)
- Many external requests use `requests` without retries, no structured error handling, sometimes return `{}` or `""` on exception. Introduce retry/backoff (e.g. `urllib3` Retry or `tenacity`) and propagate errors clearly.
- Some `timeout` values are very small (e.g., `timeout=2`) — either increase or tune per API.
- `windy_service.get_windy_data` uses `requests.post` without timeout; add timeout and error handling.

API design & consistency (medium priority)
- Endpoint naming inconsistent and duplicated (see includes) — unify to canonical REST endpoints like:
  - `GET /api/services/?city=...` (current)
  - `GET /api/antarctica/?station=...` (current)
  - Consider `GET /api/locations/?q=...` or `GET /api/weather/?city=...` for clarity.
- Use consistent status codes (some code paths use 405/406/404; review to align with REST semantics).

Performance & caching (medium priority)
- `ServicesViews` uses `cache_page(15m)` which is good; ensure caching keys vary by query params and user when needed.
- Add server-side caching for frequent queries (Redis/memcached) and CDN for static assets.

Frontend UX & maintainability (medium priority)
- Hard-coded `baseURL` and `http://127.0.0.1:8000` — extract to `.env` and `import.meta.env` via Vite.
- Use axios consistently instead of mixing `fetch` and `axios`. Centralize error handling and show consistent UI errors.
- Storing entire API response in `localStorage` may grow large; consider using indexedDB or a light in-memory cache with persistence only for small items.
- Accessibility: interactive elements should have ARIA labels and semantic buttons/inputs.

Developer experience (low/medium priority)
- No unit tests or integration tests — add tests for critical backend services and frontend components.
- Add linting (frontend has ESLint), pre-commit hooks, and CI (GitHub Actions) to run tests/lint/build.
- Add formatting (black/isort for Python, Prettier for JS) and type checks (mypy/TypeScript or PropTypes).

Prioritized action items (suggested order)
1. Fix critical bugs: undefined `user` in `LogoutView`, remove stray `detect_region("paris")` call, and remove duplicate includes in `WeatherDash/urls.py`.
2. Make API base URLs and secrets configurable via env; ensure keys are not committed.
3. Add proper CSRF handling or switch to token-based auth; remove `csrf_exempt` if not necessary.
4. Harden external calls: add timeouts, retries/backoff, logging, and graceful error propagation.
5. Centralize frontend API client and use environment variables for `baseURL`; consolidate on axios or fetch and add request/response interceptors.
6. Add tests: unit tests for `contry_convert.detect_region`, `stations.get_weather_station`, and integration tests for `ServicesViews`.
7. Add CI pipeline to run tests, linters, and build frontend.

Appendix — quick file pointers
- Backend routes: [Backend/WeatherDash/WeatherDash/urls.py](Backend/WeatherDash/WeatherDash/urls.py#L1-L200)
- Services views: [Backend/WeatherDash/services_api/views.py](Backend/WeatherDash/services_api/views.py#L1-L200)
- Services modules: [Backend/WeatherDash/services_api/weather_service.py](Backend/WeatherDash/services_api/weather_service.py#L1-L200), [Backend/WeatherDash/services_api/stations.py](Backend/WeatherDash/services_api/stations.py#L1-L200), [Backend/WeatherDash/services_api/contry_convert.py](Backend/WeatherDash/services_api/contry_convert.py#L1-L200)
- Auth views: [Backend/WeatherDash/authentification/views.py](Backend/WeatherDash/authentification/views.py#L1-L200)
- Frontend axios: [Frontend/src/axios_service/axios.jsx](Frontend/src/axios_service/axios.jsx#L1-L20)
- Frontend search and navigation: [Frontend/src/Components/Layout.jsx](Frontend/src/Components/Layout.jsx#L1-L220)

If you want, I can:
- open PR with the three immediate bug fixes, run tests (where applicable), and add a minimal CI workflow; or
- implement a safer API client (retry + timeouts) and centralize frontend `baseURL` into env.

---
Generated on: 2026-05-05
