import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./weatherGlobe.css";
import { fetchWeatherBundle, formatWeatherSnapshot, temperatureLabel } from "./weatherService";

const REGION_ROUTES = {
  Africa: "/africa",
  Antarctica: "/antarctica",
  "Central Asia": "/central-asia",
  "East Asia": "/east-asia",
  Europe: "/europe",
  "Middle East": "/middle-east",
  "North America": "/north-america",
  Oceania: "/oceania",
  "South America": "/south-america",
  "South Asia": "/south-asia",
  "Southeast Asia": "/southeast-asia",
};

function formatTimeLabel(isoString) {
  if (!isoString) {
    return "--";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function getRegionRoute(region) {
  return REGION_ROUTES[region] || "/home";
}

function detectRegionFromCoordinates(latitude, longitude) {
  if (latitude <= -60) return "Antarctica";
  if (latitude >= 35 && latitude <= 72 && longitude >= -25 && longitude <= 60) return "Europe";
  if (latitude >= 12 && latitude <= 42 && longitude >= 30 && longitude <= 60) return "Middle East";
  if (latitude >= 5 && latitude <= 35 && longitude >= 60 && longitude <= 100) return "South Asia";
  if (latitude >= -10 && latitude <= 25 && longitude >= 95 && longitude <= 140) return "Southeast Asia";
  if (latitude >= 20 && latitude <= 55 && longitude >= 100 && longitude <= 145) return "East Asia";
  if (latitude >= 35 && latitude <= 55 && longitude >= 45 && longitude <= 100) return "Central Asia";
  if (latitude >= -35 && latitude <= 37 && longitude >= -20 && longitude <= 55) return "Africa";
  if (latitude >= 7 && latitude <= 83 && longitude >= -170 && longitude <= -50) return "North America";
  if (latitude >= -56 && latitude <= 15 && longitude >= -82 && longitude <= -34) return "South America";
  if (latitude >= -50 && latitude <= 0 && longitude >= 110 && longitude <= 180) return "Oceania";

  return "Europe";
}

function buildOpenWeatherTileUrl(layerName) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${apiKey}`;
}

function createWindParticles(canvasWidth, canvasHeight, windSpeed = 5, windDirection = 0) {
  const particleCount = Math.min(120, Math.max(40, Math.floor(windSpeed * 12)));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      age: Math.random() * 100,
      maxAge: 150 + Math.random() * 100,
      speed: windSpeed * (0.5 + Math.random() * 1.5),
      angle: (windDirection * Math.PI) / 180,
    });
  }

  return particles;
}

function updateWindParticles(particles, canvasWidth, canvasHeight, windSpeed, windDirection) {
  const angle = (windDirection * Math.PI) / 180;

  particles.forEach((p) => {
    p.age += 1;
    p.x += Math.cos(angle) * p.speed * 0.8;
    p.y += Math.sin(angle) * p.speed * 0.8;

    if (p.age > p.maxAge || p.x < -10 || p.x > canvasWidth + 10 || p.y < -10 || p.y > canvasHeight + 10) {
      p.x = Math.random() * canvasWidth;
      p.y = Math.random() * canvasHeight;
      p.age = 0;
      p.maxAge = 150 + Math.random() * 100;
      p.speed = windSpeed * (0.5 + Math.random() * 1.5);
      p.angle = angle;
    }
  });
}

function drawWindParticles(ctx, particles, canvasWidth, canvasHeight) {
  particles.forEach((p) => {
    const alpha = 1 - p.age / p.maxAge;
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + alpha * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

export default function WeatherGlobe() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const weatherLayersRef = useRef({});
  const windCanvasRef = useRef(null);
  const windParticlesRef = useRef([]);
  const windAnimationRef = useRef(null);
  const firstLoadRef = useRef(true);

  const [snapshot, setSnapshot] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [forecastIndex, setForecastIndex] = useState(0);
  const [statusText, setStatusText] = useState("Pick a point on the map to inspect weather.");
  const [error, setError] = useState("");
  const [overlayState, setOverlayState] = useState({
    heatmap: true,
    rain: false,
    wind: false,
  });

  const activeForecast = useMemo(() => {
    if (!snapshot?.forecast?.length) {
      return null;
    }

    return snapshot.forecast[forecastIndex] || snapshot.forecast[0];
  }, [forecastIndex, snapshot]);

  const selectedWeather = activeForecast || snapshot?.current || null;
  const regionLabel = selectedPoint
    ? detectRegionFromCoordinates(selectedPoint.latitude, selectedPoint.longitude)
    : "World";
  const weatherOverlayAvailability = {
    heatmap: Boolean(buildOpenWeatherTileUrl("temp_new")),
    rain: Boolean(buildOpenWeatherTileUrl("precipitation_new")),
    wind: Boolean(buildOpenWeatherTileUrl("wind_new")),
  };

  const updateMapMarker = (latitude, longitude) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!markerLayerRef.current) {
      markerLayerRef.current = L.layerGroup().addTo(map);
    }

    markerLayerRef.current.clearLayers();

    const pointMarker = L.circleMarker([latitude, longitude], {
      radius: 10,
      color: "#93c5fd",
      weight: 3,
      fillColor: "#60a5fa",
      fillOpacity: 0.85,
    }).addTo(markerLayerRef.current);

    L.circle([latitude, longitude], {
      radius: 120000,
      color: "#60a5fa",
      weight: 1,
      fillColor: "#60a5fa",
      fillOpacity: 0.08,
    }).addTo(markerLayerRef.current);

    pointMarker.bindTooltip("Selected location", { permanent: false, direction: "top" });
  };

  const toggleOverlay = (overlayName) => {
    setOverlayState((current) => ({
      ...current,
      [overlayName]: !current[overlayName],
    }));
  };

  useEffect(() => {
    const map = mapRef.current;
    const layers = weatherLayersRef.current;

    if (!map) {
      return;
    }

    ["heatmap", "rain", "wind"].forEach((overlayName) => {
      const layer = layers[overlayName];
      if (!layer) {
        return;
      }

      const shouldShow = overlayState[overlayName];
      const isVisible = map.hasLayer(layer);

      if (shouldShow && !isVisible) {
        layer.addTo(map);
      }

      if (!shouldShow && isVisible) {
        map.removeLayer(layer);
      }
    });
  }, [overlayState]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const shouldShowWind = overlayState.wind;

    if (!shouldShowWind) {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
        windAnimationRef.current = null;
      }

      if (windCanvasRef.current && windCanvasRef.current.parentNode) {
        windCanvasRef.current.parentNode.removeChild(windCanvasRef.current);
        windCanvasRef.current = null;
      }

      return;
    }

    if (!windCanvasRef.current) {
      const container = map.getContainer();
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "399";

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      container.appendChild(canvas);
      windCanvasRef.current = canvas;

      if (!windParticlesRef.current.length) {
        windParticlesRef.current = createWindParticles(
          canvas.width,
          canvas.height,
          selectedWeather?.windSpeed || 5,
          selectedWeather?.windDirection || 0,
        );
      }

      const animate = () => {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(8, 22, 45, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (selectedWeather?.windSpeed != null) {
          updateWindParticles(windParticlesRef.current, canvas.width, canvas.height, selectedWeather.windSpeed, selectedWeather.windDirection || 0);
          drawWindParticles(ctx, windParticlesRef.current, canvas.width, canvas.height);
        }

        windAnimationRef.current = requestAnimationFrame(animate);
      };

      windAnimationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
        windAnimationRef.current = null;
      }
    };
  }, [overlayState.wind, selectedWeather]);


  const selectPoint = async (latitude, longitude, { centerMap = true, label = "Selected point" } = {}) => {
    const map = mapRef.current;

    if (centerMap && map) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 5), { animate: true });
    }

    setSelectedPoint({ latitude, longitude });
    setError("");
    setStatusText(`${label}: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
    updateMapMarker(latitude, longitude);

    try {
      const weatherBundle = await fetchWeatherBundle(latitude, longitude);
      const formatted = formatWeatherSnapshot(weatherBundle);
      setSnapshot(formatted);
      setForecastIndex(0);
      setStatusText(
        `${formatted?.current?.city || "Selected location"}${formatted?.current?.country ? `, ${formatted.current.country}` : ""}`
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load weather data");
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      return undefined;
    }

    const map = L.map("weather-map", {
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true,
    }).setView([20, 0], 2);

    const openWeatherHeatmap = buildOpenWeatherTileUrl("temp_new");
    const openWeatherRain = buildOpenWeatherTileUrl("precipitation_new");
    const openWeatherWind = buildOpenWeatherTileUrl("wind_new");

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 7,
      minZoom: 2,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const overlayLayers = {
      heatmap: openWeatherHeatmap
        ? L.tileLayer(openWeatherHeatmap, {
            opacity: 2,
            maxZoom: 7,
            attribution: "© OpenWeather",
          })
        : null,
      rain: openWeatherRain
        ? L.tileLayer(openWeatherRain, {
            opacity: 2,
            maxZoom: 7,
            attribution: "© OpenWeather",
          })
        : null,
      wind: openWeatherWind
        ? L.tileLayer(openWeatherWind, {
            opacity: 1,
            maxZoom: 7,
            attribution: "© OpenWeather",
          })
        : null,
    };

    weatherLayersRef.current = overlayLayers;

    if (overlayLayers.heatmap) {
      overlayLayers.heatmap.addTo(map);
    }

    map.on("click", (event) => {
      selectPoint(event.latlng.lat, event.latlng.lng, { centerMap: true, label: "Clicked map" });
    });

    mapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!firstLoadRef.current) {
            return;
          }

          firstLoadRef.current = false;
          selectPoint(position.coords.latitude, position.coords.longitude, {
            centerMap: true,
            label: "Current location",
          });
        },
        () => {
          if (!firstLoadRef.current) {
            return;
          }

          firstLoadRef.current = false;
          selectPoint(20, 0, { centerMap: true, label: "Default location" });
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 120000 }
      );
    } else {
      firstLoadRef.current = false;
      selectPoint(20, 0, { centerMap: true, label: "Default location" });
    }

    return () => {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
        windAnimationRef.current = null;
      }

      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      windCanvasRef.current = null;
      windParticlesRef.current = [];
      weatherLayersRef.current = {};
    };
  }, []);

  return (
    <div className="weather-map">
      <aside className="weather-map__panel">
        <div>
          <div className="weather-map__eyebrow">2D Weather Map</div>
          <h1 className="weather-map__title">Fast weather exploration</h1>
          <p className="weather-map__description">
            The 3D globe has been replaced with a lighter 2D map so the page opens faster and stays responsive.
          </p>
        </div>

        <div className="weather-map__status-card">
          <div className="weather-map__status-label">Selected point</div>
          <div className="weather-map__status-value">
            {selectedPoint
              ? `${selectedPoint.latitude.toFixed(2)}, ${selectedPoint.longitude.toFixed(2)}`
              : "Select a point on the map"}
          </div>
          <div className="weather-map__mini-row">
            <span>Region</span>
            <strong>{regionLabel}</strong>
          </div>
          <div className="weather-map__mini-row">
            <span>Last update</span>
            <strong>{snapshot?.current?.fetchedAt ? formatTimeLabel(snapshot.current.fetchedAt) : "--"}</strong>
          </div>
        </div>

        <div className="weather-map__status-card weather-map__layer-card">
          <div className="weather-map__status-label">Map layers</div>
          <div className="weather-map__layer-list">
            <button
              type="button"
              className={overlayState.heatmap ? "is-active" : ""}
              onClick={() => toggleOverlay("heatmap")}
              disabled={!weatherOverlayAvailability.heatmap}
            >
              Heatmap
            </button>
            <button
              type="button"
              className={overlayState.rain ? "is-active" : ""}
              onClick={() => toggleOverlay("rain")}
              disabled={!weatherOverlayAvailability.rain}
            >
              Rain
            </button>
            <button
              type="button"
              className={overlayState.wind ? "is-active" : ""}
              onClick={() => toggleOverlay("wind")}
              disabled={!weatherOverlayAvailability.wind}
            >
              Wind
            </button>
          </div>
          <div className="weather-map__layer-note">
            {weatherOverlayAvailability.heatmap
              ? "OpenWeather layers are live and can be switched instantly."
              : "Set VITE_OPENWEATHER_API_KEY to enable the heatmap, rain, and wind overlays."}
          </div>
        </div>

        {selectedWeather && (
          <div className="weather-map__forecast-card">
            <div className="weather-map__forecast-head">
              <div>
                <div className="weather-map__status-label">Weather snapshot</div>
                <div className="weather-map__forecast-city">
                  {snapshot?.current?.city || "Unknown"}
                  {snapshot?.current?.country ? `, ${snapshot.current.country}` : ""}
                </div>
                <div className="weather-map__forecast-city-hint">Tap anywhere on the map to switch location</div>
              </div>
              <div className="weather-map__forecast-temp">{temperatureLabel(selectedWeather.temperature)}</div>
            </div>

            <div className="weather-map__stats-grid">
              <div>
                <span>Wind</span>
                <strong>{selectedWeather.windSpeed != null ? `${selectedWeather.windSpeed.toFixed(1)} m/s` : "--"}</strong>
              </div>
              <div>
                <span>Direction</span>
                <strong>{selectedWeather.windDirection != null ? `${Math.round(selectedWeather.windDirection)}°` : "--"}</strong>
              </div>
              <div>
                <span>Humidity</span>
                <strong>{selectedWeather.humidity != null ? `${selectedWeather.humidity}%` : "--"}</strong>
              </div>
              <div>
                <span>Condition</span>
                <strong>{selectedWeather.condition || "--"}</strong>
              </div>
            </div>

            {snapshot?.forecast?.length > 0 && (
              <div className="weather-map__slider">
                <div className="weather-map__slider-top">
                  <span>Forecast timeline</span>
                  <strong>{forecastIndex === 0 ? "Current" : formatTimeLabel(snapshot.forecast[forecastIndex]?.timestamp)}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max={snapshot.forecast.length - 1}
                  step="1"
                  value={forecastIndex}
                  onChange={(event) => setForecastIndex(Number(event.target.value))}
                />
                <div className="weather-map__slider-foot">
                  <span>Current</span>
                  <span>{snapshot.forecast.length - 1} steps ahead</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="weather-map__actions">
          <button type="button" onClick={() => navigate("/home")}>Back to dashboard</button>
          {selectedPoint && (
            <button
              type="button"
              onClick={() => navigate(getRegionRoute(detectRegionFromCoordinates(selectedPoint.latitude, selectedPoint.longitude)))}
            >
              Open region page
            </button>
          )}
        </div>

        {error && <div className="weather-map__error">{error}</div>}
        <div className="weather-map__hint">No loading screen, no globe spin, just the map.</div>
        <div className="weather-map__hint">{statusText}</div>
      </aside>

      <main className="weather-map__canvas-wrap">
        <div id="weather-map" className="weather-map__canvas" />
        <div className="weather-map__overlay-badge">2D map view</div>
      </main>
    </div>
  );
}