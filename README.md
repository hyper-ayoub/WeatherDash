# WeatherDash 🌍

A full-stack weather application built with **Django** and **React**, focused on global weather intelligence across all world regions.

---

## Screenshots

<img width="1912" alt="Landing" src="https://github.com/user-attachments/assets/b1f57a67-5b9e-4ed2-ba49-378162788cbb" />
<img width="1912" alt="Sign In" src="https://github.com/user-attachments/assets/c2910579-6e20-4dae-95cf-5d6b0fc923a8" />
<img width="1912" alt="Sign Up" src="https://github.com/user-attachments/assets/f520e53d-545b-4440-ab55-a36894951f6f" />
<img width="1887" alt="Dashboard" src="https://github.com/user-attachments/assets/6ae20292-6b24-49d2-b82c-9feb44a7ddc7" />

---

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Frontend | React + Vite        |
| Backend  | Django              |
| Weather  | OpenWeatherMap API  |
| Images   | Unsplash API        |
| Radar    | Windy API           |
| Maps     | Nominatim (OSM)     |

---

## Features

- 🌍 **11 World Regions** — Africa, Europe, North America, South America, Middle East, South Asia, Southeast Asia, East Asia, Central Asia, Oceania, Antarctica
- 📍 **Auto Location Detection** — detects your city on first visit, cached forever
- 🌡️ **Live Weather** — temperature, humidity, wind, pressure, visibility
- 📅 **7-Day Forecast** — daily high/low with weather conditions

---

## Project Structure

```
Backend/              # Django backend
Frontend/             # React + Vite frontend
```

---

## Getting Started

### Backend

```bash
cd WeatherDash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/services/?city=Paris` | Current weather + forecast + radar |
| `/api/antarctica/?station=McMurdo Station` | Antarctica stations weather |

---

