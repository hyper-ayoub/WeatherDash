import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchWeatherBundle, formatWeatherSnapshot } from "../weather-globe/weatherService";

function createWindParticles(map, windSpeed = 5, windDirection = 0) {
  // Create particles positioned randomly within current map bounds (lat/lon)
  const bounds = map.getBounds();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  // Increase multiplier and cap for denser particle field
  const particleCount = Math.min(4000, Math.max(600, Math.floor(windSpeed * 30)));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const lat = south + Math.random() * (north - south);
    const lon = west + Math.random() * (east - west);
    particles.push({
      lat,
      lon,
      age: Math.random() * 200,
      maxAge: 250 + Math.random() * 100,
      speed: windSpeed * (0.5 + Math.random() * 1.5),
      angle: (windDirection * Math.PI) / 180,
    });
  }

  return particles;
}

function updateWindParticles(particles, map, windSpeed, windDirection) {
  const angle = (windDirection * Math.PI) / 180;
  const bounds = map.getBounds().pad(0.3); // allow some leeway off-screen

  particles.forEach((p) => {
    p.age += 1;

    // Convert lat/lon to container point (pixels), move by pixel delta, then convert back
    const pt = map.latLngToContainerPoint([p.lat, p.lon]);
    // pixel speed scale — tuneable constant
    const scale = 0.6;
    const dx = Math.cos(angle) * p.speed * scale;
    const dy = Math.sin(angle) * p.speed * scale;
    const newPt = L.point(pt.x + dx, pt.y + dy);
    const newLatLng = map.containerPointToLatLng(newPt);

    p.lat = newLatLng.lat;
    p.lon = newLatLng.lng;

    if (p.age > p.maxAge || !bounds.contains([p.lat, p.lon])) {
      // respawn within bounds
      const b = map.getBounds();
      p.lat = b.getSouth() + Math.random() * (b.getNorth() - b.getSouth());
      p.lon = b.getWest() + Math.random() * (b.getEast() - b.getWest());
      p.age = 0;
      p.maxAge = 150 + Math.random() * 100;
      p.speed = windSpeed * (0.5 + Math.random() * 1.5);
      p.angle = angle;
    }
  });
}

function drawWindParticles(ctx, particles, map) {
  particles.forEach((p) => {
    const pt = map.latLngToContainerPoint([p.lat, p.lon]);
    const alpha = 1 - p.age / p.maxAge;
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2 + alpha * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function buildOpenWeatherTileUrl(layerName) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${apiKey}`;
}

export default function RegionDefaultView({ regionName, regionCoords }) {
  const mapRef = useRef(null);
  const windCanvasRef = useRef(null);
  const windParticlesRef = useRef([]);
  const windAnimationRef = useRef(null);
  const overlayLayersRef = useRef({});
  const [weather, setWeather] = useState(null);
  const [overlayState, setOverlayState] = useState({
    heatmap: true,
    rain: false,
    wind: false,
  });

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const map = L.map("region-map-container", {
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true,
    }).setView(regionCoords || [20, 0], 4);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 7,
      minZoom: 2,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const openWeatherHeatmap = buildOpenWeatherTileUrl("temp_new");
    const openWeatherRain = buildOpenWeatherTileUrl("precipitation_new");

    const heatmapLayer = openWeatherHeatmap
      ? L.tileLayer(openWeatherHeatmap, {
          opacity: 1,
          maxZoom: 7,
          attribution: "© OpenWeather",
        })
      : null;

    const rainLayer = openWeatherRain
      ? L.tileLayer(openWeatherRain, {
          opacity: 1,
          maxZoom: 7,
          attribution: "© OpenWeather",
        })
      : null;

    overlayLayersRef.current = {
      heatmap: heatmapLayer,
      rain: rainLayer,
    };

    // Add heatmap by default
    if (heatmapLayer) {
      heatmapLayer.addTo(map);
    }

    mapRef.current = map;

    if (regionCoords) {
      (async () => {
        try {
          const bundle = await fetchWeatherBundle(regionCoords[0], regionCoords[1]);
          const formatted = formatWeatherSnapshot(bundle);
          setWeather(formatted);

          if (formatted?.current?.windSpeed != null) {
            windParticlesRef.current = createWindParticles(
              map,
              formatted.current.windSpeed,
              formatted.current.windDirection || 0,
            );
          }
        } catch (error) {
          console.error("Error fetching region weather:", error);
        }
      })();
    }

    return () => {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
      }

      if (windCanvasRef.current && windCanvasRef.current.parentNode) {
        try {
          const handler = windCanvasRef.current._resizeHandler;
          if (handler) map.off("resize", handler);
        } catch (e) {
          // ignore
        }
        windCanvasRef.current.parentNode.removeChild(windCanvasRef.current);
      }

      map.remove();
      mapRef.current = null;
    };
  }, [regionCoords]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const shouldShowWind = overlayState.wind && weather?.current?.windSpeed != null;

    if (!shouldShowWind) {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
        windAnimationRef.current = null;
      }

      if (windCanvasRef.current && windCanvasRef.current.parentNode) {
        try {
          const handler = windCanvasRef.current._resizeHandler;
          if (handler) map.off("resize", handler);
        } catch (e) {
          // ignore
        }
        windCanvasRef.current.parentNode.removeChild(windCanvasRef.current);
        windCanvasRef.current = null;
      }

      return;
    }

    if (!windCanvasRef.current) {
      // Ensure a dedicated pane exists above tiles for the wind canvas
      const paneName = "windPane";
      if (!map.getPane(paneName)) {
        map.createPane(paneName);
        const p = map.getPane(paneName);
        p.style.zIndex = 650; // above overlay/tile panes
        p.style.pointerEvents = "none";
      }

      const pane = map.getPane("windPane");
      const canvas = document.createElement("canvas");
      canvas.className = "region-wind-canvas";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";

      const setCanvasSize = () => {
        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
      };

      setCanvasSize();
      pane.appendChild(canvas);
      windCanvasRef.current = canvas;

      // Listen for map size changes to keep canvas in sync
      map.on("resize", setCanvasSize);

      const animate = () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(8, 22, 45, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (weather?.current?.windSpeed != null) {
          updateWindParticles(windParticlesRef.current, map, weather.current.windSpeed, weather.current.windDirection || 0);
          drawWindParticles(ctx, windParticlesRef.current, map);
        }

        windAnimationRef.current = requestAnimationFrame(animate);
      };

      windAnimationRef.current = requestAnimationFrame(animate);

      // store resize handler for cleanup
      windCanvasRef.current._resizeHandler = setCanvasSize;
    }

    return () => {
      if (windAnimationRef.current) {
        cancelAnimationFrame(windAnimationRef.current);
      }
    };
  }, [overlayState.wind, weather]);

  const toggleOverlay = (overlayName) => {
    setOverlayState((current) => ({
      ...current,
      [overlayName]: !current[overlayName],
    }));
  };

  const hasWeatherApi = Boolean(buildOpenWeatherTileUrl("temp_new"));

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const { heatmap: heatmapLayer, rain: rainLayer } = overlayLayersRef.current;

    // Handle heatmap toggle
    if (overlayState.heatmap && heatmapLayer && !map.hasLayer(heatmapLayer)) {
      heatmapLayer.addTo(map);
    } else if (!overlayState.heatmap && heatmapLayer && map.hasLayer(heatmapLayer)) {
      map.removeLayer(heatmapLayer);
    }

    // Handle rain toggle
    if (overlayState.rain && rainLayer && !map.hasLayer(rainLayer)) {
      rainLayer.addTo(map);
    } else if (!overlayState.rain && rainLayer && map.hasLayer(rainLayer)) {
      map.removeLayer(rainLayer);
    }
  }, [overlayState.heatmap, overlayState.rain]);

  return (
    <div className="region-default-view">
      <div className="region-map-topbar">
        <div>
          <p className="region-map-kicker">Interactive Weather Map</p>
          <h1 className="region-map-title">{regionName}</h1>
          <p className="region-map-copy">
            Full-screen weather map with live heatmap, rain, and wind overlays. Use the search bar above to switch to a city.
          </p>
        </div>
        <Link to="/home" className="region-map-home-link">Back to Home</Link>
      </div>

      <div className="region-map-controls">
        <button
          type="button"
          className={overlayState.heatmap ? "is-active" : ""}
          onClick={() => toggleOverlay("heatmap")}
          disabled={!hasWeatherApi}
          title="Temperature Heatmap"
        >
          Heat
        </button>
        <button
          type="button"
          className={overlayState.rain ? "is-active" : ""}
          onClick={() => toggleOverlay("rain")}
          disabled={!hasWeatherApi}
          title="Precipitation"
        >
          Rain
        </button>
        <button
          type="button"
          className={overlayState.wind ? "is-active" : ""}
          onClick={() => toggleOverlay("wind")}
          title="Wind Particles"
        >
          Wind
        </button>
      </div>

      <div id="region-map-container" className="region-map-canvas" />
    </div>
  );
}
