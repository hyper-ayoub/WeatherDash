@echo off
REM Start Django Backend
start "Backend Django" cmd /k "cd /d Backend && call venv\Scripts\activate.bat && cd WeatherDash && python manage.py runserver"

REM Start React Frontend
start "React JS Frontend" cmd /k "cd /d Frontend && npm run dev"
pause
