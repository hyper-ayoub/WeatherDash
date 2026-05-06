import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./weatherGlobe.css";
import {
  clamp,
  destinationPoint,
  fetchWeatherBundle,
  formatWeatherSnapshot,
  normalizeWindSnapshot,
  temperatureLabel,
  temperatureToColor,
  wrapLongitude,
} from "./weatherService";

const OSM_IMAGERY_URL = "https://tile.openstreetmap.org/";
const PARTICLE_COUNT = 220;
const PARTICLE_HEIGHT_METERS = 2200;
const PARTICLE_SPEED_SCALE = 120;
const MAX_WIND_FPS_STEP_SECONDS = 0.05;
const REGION_ROUTES = {
  "Africa": "/africa",
  "Antarctica": "/antarctica",
  "Central Asia": "/central-asia",
  "East Asia": "/east-asia",
  "Europe": "/europe",
  "Middle East": "/middle-east",
  "North America": "/north-america",
  "Oceania": "/oceania",
  "South America": "/south-america",
  "South Asia": "/south-asia",
  "Southeast Asia": "/southeast-asia",
};

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function colorToCss({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatTimeLabel(isoString) {
  if (!isoString) return "--";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function getRegionRoute(region) {
  return REGION_ROUTES[region] || "/home";
}

function buildWindyEmbedUrl(latitude, longitude) {
  return `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=5&level=surface&overlay=wind`;
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

function buildRegionPayload(snapshot, latitude, longitude, region) {
  return {
    region,
    weather: snapshot?.current?.raw || null,
    forecast: {
      list: snapshot?.forecast?.map((item) => item.raw) || [],
    },
    image: null,
    windy_embed: buildWindyEmbedUrl(latitude, longitude),
  };
}

function buildTemperatureOverlayCanvas(point, snapshot) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return canvas;
  }

  const temperature = Number(snapshot?.temperature ?? snapshot?.current?.temperature ?? point?.temperature ?? 20);
  const baseColor = temperatureToColor(temperature);
  const alpha = clamp(((temperature + 10) / 50) * 0.85, 0.28, 0.85);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a soft halo centered on the selected point. This is intentionally
  // lightweight so Cesium can keep the globe interactive while the overlay updates.
  const x = ((wrapLongitude(point.longitude) + 180) / 360) * canvas.width;
  const y = ((90 - point.latitude) / 180) * canvas.height;
  const radius = Math.max(canvas.width, canvas.height) * 0.32;

  const gradient = ctx.createRadialGradient(x, y, radius * 0.06, x, y, radius);
  gradient.addColorStop(0, colorToCss(baseColor, alpha));
  gradient.addColorStop(0.35, colorToCss(baseColor, alpha * 0.45));
  gradient.addColorStop(0.7, colorToCss(baseColor, alpha * 0.16));
  gradient.addColorStop(1, colorToCss(baseColor, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "screen";
  const bandGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bandGradient.addColorStop(0, "rgba(255,255,255,0)");
  bandGradient.addColorStop(0.5, colorToCss(baseColor, alpha * 0.2));
  bandGradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bandGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = colorToCss(baseColor, 0.2);
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

function createWindParticles(viewer, collection, origin, windSnapshot) {
  collection.removeAll();

  const currentWind = normalizeWindSnapshot(windSnapshot);
  const flowBearing = (currentWind.direction + 180) % 360;
  const baseSpeed = Math.max(currentWind.speed, 0.5);
  const particles = [];

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const spreadDistanceKm = 4 + Math.random() * 38;
    const spreadBearing = Math.random() * 360;
    const seed = destinationPoint(origin.latitude, origin.longitude, spreadDistanceKm, spreadBearing);
    const height = PARTICLE_HEIGHT_METERS + Math.random() * 1800;

    const particle = {
      latitude: seed.latitude,
      longitude: seed.longitude,
      height,
      age: Math.random() * 2,
      life: 4 + Math.random() * 5,
      speedScale: 0.75 + Math.random() * 0.75,
      jitter: Math.random() * 360,
      point: collection.add({
        position: Cesium.Cartesian3.fromDegrees(seed.longitude, seed.latitude, height),
        color: Cesium.Color.CYAN.withAlpha(0.45),
        pixelSize: 2 + Math.random() * 2,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.15),
        outlineWidth: 1,
      }),
    };

    particles.push(particle);
  }

  const update = (deltaSeconds) => {
    const safeDelta = clamp(deltaSeconds, 0, MAX_WIND_FPS_STEP_SECONDS);
    const travelKm = baseSpeed * safeDelta * (PARTICLE_SPEED_SCALE / 1000);

    for (const particle of particles) {
      particle.age += safeDelta;
      const animatedBearing = flowBearing + Math.sin((particle.jitter + particle.age * 24) * (Math.PI / 180)) * 14;
      const next = destinationPoint(particle.latitude, particle.longitude, travelKm * particle.speedScale, animatedBearing);

      particle.latitude = clamp(next.latitude, -86, 86);
      particle.longitude = wrapLongitude(next.longitude);

      if (particle.age >= particle.life) {
        const reset = destinationPoint(origin.latitude, origin.longitude, 4 + Math.random() * 28, Math.random() * 360);
        particle.latitude = reset.latitude;
        particle.longitude = reset.longitude;
        particle.age = 0;
        particle.life = 4 + Math.random() * 5;
      }

      const fade = 1 - particle.age / particle.life;
      const alpha = clamp(fade * 0.85, 0.08, 0.85);
      const tint = Cesium.Color.fromAlpha(Cesium.Color.WHITE, alpha);
      particle.point.position = Cesium.Cartesian3.fromDegrees(
        particle.longitude,
        particle.latitude,
        particle.height,
      );
      particle.point.color = tint;
      particle.point.pixelSize = 1.8 + (1 - fade) * 2.2;
    }
  };

  return { particles, update };
}

function replaceParticleSystem(viewer, systemRef, origin, windSource) {
  if (systemRef.current?.collection) {
    viewer.scene.primitives.remove(systemRef.current.collection);
  }

  const collection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
  systemRef.current = createWindParticles(viewer, collection, origin, windSource);
}

export default function WeatherGlobe() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const particleSystemRef = useRef(null);
  const overlayEntityRef = useRef(null);
  const markerEntityRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const lastFrameRef = useRef(null);
  const activePointRef = useRef(null);
  const destroyRef = useRef(false);
  const handlerRef = useRef(null);
  const cameraStopTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [forecastIndex, setForecastIndex] = useState(0);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.8);

  const activeForecast = useMemo(() => {
    if (!snapshot?.forecast?.length) {
      return null;
    }
    return snapshot.forecast[forecastIndex] || snapshot.forecast[0];
  }, [forecastIndex, snapshot]);

  const displayWind = activeForecast || snapshot?.current || null;

  const syncScene = (point, nextSnapshot, nextForecastIndex = 0) => {
    const viewer = viewerRef.current;
    if (!viewer || !point || !nextSnapshot) {
      return;
    }

    activePointRef.current = point;
    setSelectedPoint(point);
    setSnapshot(nextSnapshot);
    setForecastIndex(nextForecastIndex);

    const windSource = nextForecastIndex > 0 ? nextSnapshot.forecast[nextForecastIndex] : nextSnapshot.current;
    const canvas = buildTemperatureOverlayCanvas(point, windSource);

    if (overlayEntityRef.current) {
      viewer.entities.remove(overlayEntityRef.current);
    }

    overlayEntityRef.current = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        material: new Cesium.ImageMaterialProperty({
          image: canvas,
          transparent: true,
          color: Cesium.Color.WHITE.withAlpha(0.8),
        }),
        height: 100,
      },
    });

    replaceParticleSystem(viewer, particleSystemRef, point, windSource);
  };

  const loadWeatherAtPoint = async (latitude, longitude, { redirect = true } = {}) => {
    const point = { latitude, longitude };
    setLoading(true);
    setError("");

    try {
      console.log("Loading weather for:", latitude, longitude, "redirect:", redirect);
      const weatherBundle = await fetchWeatherBundle(latitude, longitude);
      if (destroyRef.current) {
        return;
      }

      const formatted = formatWeatherSnapshot(weatherBundle);
      console.log("Weather fetched, formatted:", formatted?.current?.city);
      setSnapshot(formatted);
      setForecastIndex(0);
      syncScene(point, formatted, 0);

      if (redirect) {
        const city = formatted?.current?.city || "";
        console.log("City resolved:", city);

        if (city) {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/services/?city=${encodeURIComponent(city)}`);
            if (!response.ok) {
              throw new Error(`City lookup failed (${response.status})`);
            }

            const data = await response.json();
            console.log("Backend lookup result:", data);
            if (destroyRef.current) {
              return;
            }

            const region = data?.region || detectRegionFromCoordinates(latitude, longitude);
            console.log("Region resolved:", region);
            const payload = data?.region ? data : buildRegionPayload(formatted, latitude, longitude, region);
            const storageKey = `weatherData_${region}`;

            localStorage.setItem(storageKey, JSON.stringify(payload));
            window.dispatchEvent(new Event("cityChanged"));
            console.log("Navigating to:", getRegionRoute(region));
            navigate(getRegionRoute(region));
            return;
          } catch (err) {
            console.error("City lookup error, using fallback:", err);
            if (destroyRef.current) {
              return;
            }
          }
        }

        const region = detectRegionFromCoordinates(latitude, longitude);
        console.log("Fallback region:", region);
        const payload = buildRegionPayload(formatted, latitude, longitude, region);
        localStorage.setItem(`weatherData_${region}`, JSON.stringify(payload));
        window.dispatchEvent(new Event("cityChanged"));
        console.log("Navigating to:", getRegionRoute(region));
        navigate(getRegionRoute(region));
      }
    } catch (fetchError) {
      console.error("Weather fetch error:", fetchError);
      if (destroyRef.current) {
        return;
      }
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch weather data");
    } finally {
      if (!destroyRef.current) {
        setLoading(false);
      }
    }
  };

  const getCenterCoordinates = () => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.canvas) {
      return null;
    }

    try {
      const canvas = viewer.canvas;
      const centerX = (canvas.clientWidth || canvas.width) / 2;
      const centerY = (canvas.clientHeight || canvas.height) / 2;

      const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(centerX, centerY));
      if (!ray) {
        return null;
      }

      const cartesian = viewer.scene.globe.pick(ray, viewer.scene) || viewer.camera.pickEllipsoid(new Cesium.Cartesian2(centerX, centerY), viewer.scene.globe.ellipsoid);
      if (!cartesian) {
        return null;
      }

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
      };
    } catch (err) {
      console.error("Error getting center coordinates:", err);
      return null;
    }
  };

  const handleCameraStop = async () => {
    const coords = getCenterCoordinates();
    if (!coords) {
      return;
    }

    console.log("Camera stopped, auto-selecting at:", coords.latitude, coords.longitude);
    await loadWeatherAtPoint(coords.latitude, coords.longitude, { redirect: false });
  };

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: `${OSM_IMAGERY_URL}{z}/{x}/{y}.png`,
      credit: "© OpenStreetMap contributors",
    });

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      shouldAnimate: true,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      imageryProvider,
    });

    viewerRef.current = viewer;
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(imageryProvider);
    const heatmapKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (heatmapKey) {
      const heatmapProvider = new Cesium.UrlTemplateImageryProvider({
        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${heatmapKey}`,
        credit: "OpenWeather",
      });
      const heatmapLayer = viewer.imageryLayers.addImageryProvider(heatmapProvider);
      heatmapLayer.alpha = heatmapOpacity;
      heatmapLayer.show = heatmapEnabled;
      heatmapLayerRef.current = heatmapLayer;
    } else {
      setError((current) => current || "Missing VITE_OPENWEATHER_API_KEY for heatmap layer");
    }
    viewer.scene.globe.show = true;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#04111f");
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.skyAtmosphere.hueShift = 0.15;
    viewer.scene.skyAtmosphere.saturationShift = 0.7;
    viewer.scene.skyAtmosphere.brightnessShift = -0.15;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.1;

    handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    const frameHandler = (_scene, time) => {
      if (!particleSystemRef.current) {
        lastFrameRef.current = time;
        return;
      }

      const last = lastFrameRef.current;
      lastFrameRef.current = time;
      if (!last) {
        return;
      }

      const deltaSeconds = Cesium.JulianDate.secondsDifference(time, last);
      particleSystemRef.current.update(deltaSeconds);
    };

    viewer.scene.postRender.addEventListener(frameHandler);

    // Listen for camera movement and auto-select when stopped
    const cameraStopHandler = () => {
      if (cameraStopTimeoutRef.current) {
        clearTimeout(cameraStopTimeoutRef.current);
      }

      cameraStopTimeoutRef.current = setTimeout(() => {
        if (!destroyRef.current) {
          handleCameraStop();
        }
      }, 600);
    };

    viewer.camera.changed.addEventListener(cameraStopHandler);
    viewer.camera.moveEnd.addEventListener(handleCameraStop);

    const flyTo = (latitude, longitude) => {
      const currentViewer = viewerRef.current;
      if (!currentViewer || currentViewer.isDestroyed?.()) {
        return;
      }

      currentViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 3_500_000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-25),
          roll: 0,
        },
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (destroyRef.current) {
            return;
          }
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          flyTo(latitude, longitude);
          loadWeatherAtPoint(latitude, longitude, { redirect: false });
        },
        () => {
          if (destroyRef.current) {
            return;
          }
          flyTo(20, 0);
          loadWeatherAtPoint(20, 0, { redirect: false });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
      );
    } else {
      flyTo(20, 0);
      loadWeatherAtPoint(20, 0, { redirect: false });
    }

    return () => {
      destroyRef.current = true;
      if (cameraStopTimeoutRef.current) {
        clearTimeout(cameraStopTimeoutRef.current);
      }
      viewer.scene.postRender.removeEventListener(frameHandler);
      viewer.camera.changed.removeEventListener(cameraStopHandler);
      viewer.camera.moveEnd.removeEventListener(handleCameraStop);
      if (handlerRef.current) {
        handlerRef.current.destroy();
      }
      if (heatmapLayerRef.current) {
        viewer.imageryLayers.remove(heatmapLayerRef.current, true);
      }
      if (particleSystemRef.current?.collection) {
        viewer.scene.primitives.remove(particleSystemRef.current.collection);
      }
      if (overlayEntityRef.current) {
        viewer.entities.remove(overlayEntityRef.current);
      }
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    const layer = heatmapLayerRef.current;
    if (!layer) {
      return;
    }
    layer.alpha = heatmapOpacity;
    layer.show = heatmapEnabled;
  }, [heatmapEnabled, heatmapOpacity]);

  useEffect(() => {
    if (!snapshot || !activePointRef.current) {
      return;
    }

    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    const windSource = forecastIndex > 0 ? snapshot.forecast[forecastIndex] : snapshot.current;
    const canvas = buildTemperatureOverlayCanvas(activePointRef.current, windSource);

    if (overlayEntityRef.current) {
      overlayEntityRef.current.rectangle.material = new Cesium.ImageMaterialProperty({
        image: canvas,
        transparent: true,
        color: Cesium.Color.WHITE.withAlpha(0.8),
      });
    }

    replaceParticleSystem(viewer, particleSystemRef, activePointRef.current, windSource);
  }, [forecastIndex, snapshot]);

  const selectedWeather = displayWind || snapshot?.current;

  return (
    <div className="weather-globe">
      <aside className="weather-globe__panel">
        <div className="weather-globe__eyebrow">Cesium Weather Globe</div>
        <h1 className="weather-globe__title">Explore the atmosphere in 3D</h1>
        <p className="weather-globe__description">
          Rotate, pan, and zoom the globe. The center marker auto-selects when you stop moving. Click the marker to open the region page.
        </p>

        <div className="weather-globe__status-card">
          <div className="weather-globe__status-label">Selected point</div>
          <div className="weather-globe__status-value">
            {selectedPoint ? `${selectedPoint.latitude.toFixed(2)}, ${selectedPoint.longitude.toFixed(2)}` : "Waiting for selection"}
          </div>
          <div className="weather-globe__mini-row">
            <span>Provider</span>
            <strong>{snapshot?.provider || "openweather"}</strong>
          </div>
          <div className="weather-globe__mini-row">
            <span>Last update</span>
            <strong>{snapshot?.current?.fetchedAt ? formatTimeLabel(snapshot.current.fetchedAt) : "--"}</strong>
          </div>
        </div>

        {selectedWeather && (
          <div className="weather-globe__forecast-card">
            <div className="weather-globe__forecast-head">
              <div>
                <div className="weather-globe__status-label">Weather snapshot</div>
                <div className="weather-globe__forecast-city">
                  {snapshot?.current?.city || "Unknown"}{snapshot?.current?.country ? `, ${snapshot.current.country}` : ""}
                </div>
                <div className="weather-globe__forecast-city-hint">Auto-selected at center marker</div>
              </div>
              <div className="weather-globe__forecast-temp">{temperatureLabel(selectedWeather.temperature)}</div>
            </div>

            <div className="weather-globe__stats-grid">
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
              <div className="weather-globe__slider">
                <div className="weather-globe__slider-top">
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
                <div className="weather-globe__slider-foot">
                  <span>Current</span>
                  <span>{snapshot.forecast.length - 1} steps ahead</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="weather-globe__legend">
          <span><i className="legend-dot cold" /> Cold</span>
          <span><i className="legend-dot mild" /> Mild</span>
          <span><i className="legend-dot hot" /> Hot</span>
        </div>

        <div className="weather-globe__heatmap">
          <div className="weather-globe__status-label">Temperature heatmap</div>
          <label className="weather-globe__toggle">
            <input
              type="checkbox"
              checked={heatmapEnabled}
              onChange={(event) => setHeatmapEnabled(event.target.checked)}
            />
            <span>Show heatmap</span>
          </label>
          <input
            type="range"
            min="0.35"
            max="1"
            step="0.05"
            value={heatmapOpacity}
            onChange={(event) => setHeatmapOpacity(Number(event.target.value))}
          />
        </div>

        <div className="weather-globe__actions">
          <a href="/home">Back to dashboard</a>
          <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer">OpenWeatherMap API</a>
        </div>

        {loading && <div className="weather-globe__loading">Loading globe and weather data...</div>}
        {error && <div className="weather-globe__error">{error}</div>}
      </aside>

      <main className="weather-globe__canvas-wrap">
        <div ref={containerRef} className="weather-globe__canvas" />

        <div className="weather-globe__center-marker" aria-hidden="true" />

        {selectedWeather && (
          <div className="weather-globe__popup">
            <div className="weather-globe__popup-title">{snapshot?.current?.city || "Selected location"}</div>
            <div className="weather-globe__popup-grid">
              <div>
                <span>Temp</span>
                <strong>{temperatureLabel(selectedWeather.temperature)}</strong>
              </div>
              <div>
                <span>Wind</span>
                <strong>{selectedWeather.windSpeed != null ? `${selectedWeather.windSpeed.toFixed(1)} m/s` : "--"}</strong>
              </div>
              <div>
                <span>Dir</span>
                <strong>{selectedWeather.windDirection != null ? `${Math.round(selectedWeather.windDirection)}°` : "--"}</strong>
              </div>
              <div>
                <span>Humidity</span>
                <strong>{selectedWeather.humidity != null ? `${selectedWeather.humidity}%` : "--"}</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
