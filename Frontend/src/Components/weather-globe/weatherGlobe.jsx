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

  if (
    latitude >= 35 &&
    latitude <= 72 &&
    longitude >= -25 &&
    longitude <= 60
  ) {
    return "Europe";
  }

  if (
    latitude >= 12 &&
    latitude <= 42 &&
    longitude >= 30 &&
    longitude <= 60
  ) {
    return "Middle East";
  }

  if (
    latitude >= 5 &&
    latitude <= 35 &&
    longitude >= 60 &&
    longitude <= 100
  ) {
    return "South Asia";
  }

  if (
    latitude >= -10 &&
    latitude <= 25 &&
    longitude >= 95 &&
    longitude <= 140
  ) {
    return "Southeast Asia";
  }

  if (
    latitude >= 20 &&
    latitude <= 55 &&
    longitude >= 100 &&
    longitude <= 145
  ) {
    return "East Asia";
  }

  if (
    latitude >= 35 &&
    latitude <= 55 &&
    longitude >= 45 &&
    longitude <= 100
  ) {
    return "Central Asia";
  }

  if (
    latitude >= -35 &&
    latitude <= 37 &&
    longitude >= -20 &&
    longitude <= 55
  ) {
    return "Africa";
  }

  if (
    latitude >= 7 &&
    latitude <= 83 &&
    longitude >= -170 &&
    longitude <= -50
  ) {
    return "North America";
  }

  if (
    latitude >= -56 &&
    latitude <= 15 &&
    longitude >= -82 &&
    longitude <= -34
  ) {
    return "South America";
  }

  if (
    latitude >= -50 &&
    latitude <= 0 &&
    longitude >= 110 &&
    longitude <= 180
  ) {
    return "Oceania";
  }

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
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return canvas;
  }

  const temperature = Number(
    snapshot?.temperature ??
      snapshot?.current?.temperature ??
      point?.temperature ??
      20
  );

  const baseColor = temperatureToColor(temperature);

  const alpha = clamp(
    ((temperature + 10) / 50) * 0.85,
    0.28,
    0.85
  );

  const x =
    ((wrapLongitude(point.longitude) + 180) / 360) * canvas.width;

  const y =
    ((90 - point.latitude) / 180) * canvas.height;

  const radius =
    Math.max(canvas.width, canvas.height) * 0.32;

  const gradient = ctx.createRadialGradient(
    x,
    y,
    radius * 0.06,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, colorToCss(baseColor, alpha));
  gradient.addColorStop(0.35, colorToCss(baseColor, alpha * 0.45));
  gradient.addColorStop(0.7, colorToCss(baseColor, alpha * 0.16));
  gradient.addColorStop(1, colorToCss(baseColor, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

function createWindParticles(viewer, collection, origin, windSnapshot) {
  collection.removeAll();

  const currentWind = normalizeWindSnapshot(windSnapshot);

  const flowBearing =
    (currentWind.direction + 180) % 360;

  const baseSpeed = Math.max(currentWind.speed, 0.5);

  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const spreadDistanceKm =
      4 + Math.random() * 38;

    const spreadBearing =
      Math.random() * 360;

    const seed = destinationPoint(
      origin.latitude,
      origin.longitude,
      spreadDistanceKm,
      spreadBearing
    );

    const particle = {
      latitude: seed.latitude,
      longitude: seed.longitude,
      height:
        PARTICLE_HEIGHT_METERS +
        Math.random() * 1800,
      age: Math.random() * 2,
      life: 4 + Math.random() * 5,
      speedScale: 0.75 + Math.random() * 0.75,
      jitter: Math.random() * 360,

      point: collection.add({
        position: Cesium.Cartesian3.fromDegrees(
          seed.longitude,
          seed.latitude,
          PARTICLE_HEIGHT_METERS
        ),

        color: Cesium.Color.CYAN.withAlpha(0.45),
        pixelSize: 2 + Math.random() * 2,
        outlineColor:
          Cesium.Color.WHITE.withAlpha(0.15),

        outlineWidth: 1,
      }),
    };

    particles.push(particle);
  }

  const update = (deltaSeconds) => {
    const safeDelta = clamp(
      deltaSeconds,
      0,
      MAX_WIND_FPS_STEP_SECONDS
    );

    const travelKm =
      baseSpeed *
      safeDelta *
      (PARTICLE_SPEED_SCALE / 1000);

    for (const particle of particles) {
      particle.age += safeDelta;

      const animatedBearing =
        flowBearing +
        Math.sin(
          (particle.jitter + particle.age * 24) *
            (Math.PI / 180)
        ) *
          14;

      const next = destinationPoint(
        particle.latitude,
        particle.longitude,
        travelKm * particle.speedScale,
        animatedBearing
      );

      particle.latitude = clamp(
        next.latitude,
        -86,
        86
      );

      particle.longitude = wrapLongitude(
        next.longitude
      );

      if (particle.age >= particle.life) {
        const reset = destinationPoint(
          origin.latitude,
          origin.longitude,
          4 + Math.random() * 28,
          Math.random() * 360
        );

        particle.latitude = reset.latitude;
        particle.longitude = reset.longitude;
        particle.age = 0;
        particle.life = 4 + Math.random() * 5;
      }

      const fade =
        1 - particle.age / particle.life;

      const alpha = clamp(
        fade * 0.85,
        0.08,
        0.85
      );

      particle.point.position =
        Cesium.Cartesian3.fromDegrees(
          particle.longitude,
          particle.latitude,
          particle.height
        );

      particle.point.color =
        Cesium.Color.fromAlpha(
          Cesium.Color.WHITE,
          alpha
        );

      particle.point.pixelSize =
        1.8 + (1 - fade) * 2.2;
    }
  };

  return {
    particles,
    update,
  };
}

function replaceParticleSystem(
  viewer,
  systemRef,
  origin,
  windSource
) {
  if (systemRef.current?.collection) {
    viewer.scene.primitives.remove(
      systemRef.current.collection
    );
  }

  const collection =
    viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection()
    );

  systemRef.current = createWindParticles(
    viewer,
    collection,
    origin,
    windSource
  );
}

export default function WeatherGlobe() {
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const particleSystemRef = useRef(null);
  const overlayEntityRef = useRef(null);

  const lastFrameRef = useRef(null);
  const activePointRef = useRef(null);

  const destroyRef = useRef(false);
  const handlerRef = useRef(null);

  const heatmapLayerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPoint, setSelectedPoint] =
    useState(null);

  const [snapshot, setSnapshot] =
    useState(null);

  const [forecastIndex, setForecastIndex] =
    useState(0);

  const [heatmapEnabled, setHeatmapEnabled] =
    useState(true);

  const [heatmapOpacity, setHeatmapOpacity] =
    useState(0.8);

  const activeForecast = useMemo(() => {
    if (!snapshot?.forecast?.length) {
      return null;
    }

    return (
      snapshot.forecast[forecastIndex] ||
      snapshot.forecast[0]
    );
  }, [forecastIndex, snapshot]);

  const displayWind =
    activeForecast || snapshot?.current || null;

  const syncScene = (
    point,
    nextSnapshot,
    nextForecastIndex = 0
  ) => {
    const viewer = viewerRef.current;

    if (!viewer || !point || !nextSnapshot) {
      return;
    }

    activePointRef.current = point;

    setSelectedPoint(point);
    setSnapshot(nextSnapshot);
    setForecastIndex(nextForecastIndex);

    const windSource =
      nextForecastIndex > 0
        ? nextSnapshot.forecast[nextForecastIndex]
        : nextSnapshot.current;

    const canvas =
      buildTemperatureOverlayCanvas(
        point,
        windSource
      );

    if (overlayEntityRef.current) {
      viewer.entities.remove(
        overlayEntityRef.current
      );
    }

    overlayEntityRef.current =
      viewer.entities.add({
        rectangle: {
          coordinates:
            Cesium.Rectangle.fromDegrees(
              -180,
              -90,
              180,
              90
            ),

          material:
            new Cesium.ImageMaterialProperty({
              image: canvas,
              transparent: true,
              color:
                Cesium.Color.WHITE.withAlpha(
                  0.8
                ),
            }),

          height: 100,
        },
      });

    replaceParticleSystem(
      viewer,
      particleSystemRef,
      point,
      windSource
    );
  };

  const loadWeatherAtPoint = async (
    latitude,
    longitude,
    { redirect = true } = {}
  ) => {
    const point = { latitude, longitude };

    activePointRef.current = point;

    setSelectedPoint(point);
    setLoading(true);
    setError("");

    try {
      const weatherBundle =
        await fetchWeatherBundle(
          latitude,
          longitude
        );

      if (destroyRef.current) {
        return;
      }

      const formatted =
        formatWeatherSnapshot(weatherBundle);

      syncScene(point, formatted, 0);

      if (!redirect) {
        return;
      }

      const region =
        detectRegionFromCoordinates(
          latitude,
          longitude
        );

      const payload = buildRegionPayload(
        formatted,
        latitude,
        longitude,
        region
      );

      localStorage.setItem(
        `weatherData_${region}`,
        JSON.stringify(payload)
      );

      navigate(getRegionRoute(region));
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch weather data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesFromPosition = (
    position
  ) => {
    const viewer = viewerRef.current;

    if (!viewer || !position) {
      return null;
    }

    try {
      let cartesian = null;

      if (
        viewer.scene.pickPositionSupported
      ) {
        cartesian =
          viewer.scene.pickPosition(position);
      }

      if (!cartesian) {
        cartesian =
          viewer.camera.pickEllipsoid(
            position,
            viewer.scene.globe.ellipsoid
          );
      }

      if (!cartesian) {
        const ray =
          viewer.camera.getPickRay(position);

        if (ray) {
          cartesian =
            viewer.scene.globe.pick(
              ray,
              viewer.scene
            );
        }
      }

      if (!cartesian) {
        return null;
      }

      const cartographic =
        Cesium.Cartographic.fromCartesian(
          cartesian
        );

      return {
        latitude: Cesium.Math.toDegrees(
          cartographic.latitude
        ),

        longitude: Cesium.Math.toDegrees(
          cartographic.longitude
        ),
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleMapClick = async (movement) => {
    if (destroyRef.current) {
      return;
    }

    const coords = getCoordinatesFromPosition(
      movement?.position
    );

    if (!coords) {
      return;
    }

    await loadWeatherAtPoint(
      coords.latitude,
      coords.longitude,
      { redirect: false }
    );
  };

  useEffect(() => {
    destroyRef.current = false;

    if (!containerRef.current) {
      return undefined;
    }

    const imageryProvider =
      new Cesium.UrlTemplateImageryProvider({
        url: `${OSM_IMAGERY_URL}{z}/{x}/{y}.png`,
        credit:
          "© OpenStreetMap contributors",
      });

    const viewer = new Cesium.Viewer(
      containerRef.current,
      {
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
        terrainProvider:
          new Cesium.EllipsoidTerrainProvider(),

        imageryProvider,
      }
    );

    viewerRef.current = viewer;

    viewer.imageryLayers.removeAll();

    viewer.imageryLayers.addImageryProvider(
      imageryProvider
    );

    const heatmapKey =
      import.meta.env.VITE_OPENWEATHER_API_KEY;

    if (heatmapKey) {
      const heatmapProvider =
        new Cesium.UrlTemplateImageryProvider({
          url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${heatmapKey}`,
          credit: "OpenWeather",
        });

      const heatmapLayer =
        viewer.imageryLayers.addImageryProvider(
          heatmapProvider
        );

      heatmapLayer.alpha =
        heatmapOpacity;

      heatmapLayer.show =
        heatmapEnabled;

      heatmapLayerRef.current =
        heatmapLayer;
    }

    viewer.scene.globe.show = true;

    handlerRef.current =
      new Cesium.ScreenSpaceEventHandler(
        viewer.canvas
      );

    handlerRef.current.setInputAction(
      handleMapClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

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

      const deltaSeconds =
        Cesium.JulianDate.secondsDifference(
          time,
          last
        );

      particleSystemRef.current.update(
        deltaSeconds
      );
    };

    viewer.scene.postRender.addEventListener(
      frameHandler
    );

    return () => {
      destroyRef.current = true;

      handlerRef.current?.destroy();

      viewer.scene.postRender.removeEventListener(
        frameHandler
      );

      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
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

  const selectedWeather =
    displayWind || snapshot?.current;

  return (
    <div className="weather-globe">
      <aside className="weather-globe__panel">
        <div className="weather-globe__eyebrow">
          Cesium Weather Globe
        </div>

        <h1 className="weather-globe__title">
          Explore the atmosphere in 3D
        </h1>

        <p className="weather-globe__description">
          Rotate, pan, and zoom the globe.
          Click anywhere on the map to
          load weather details.
        </p>

        {selectedWeather && (
          <div className="weather-globe__forecast-card">
            <div className="weather-globe__forecast-city">
              {snapshot?.current?.city ||
                "Unknown"}
            </div>

            <div className="weather-globe__forecast-temp">
              {temperatureLabel(
                selectedWeather.temperature
              )}
            </div>

            <div className="weather-globe__stats-grid">
              <div>
                <span>Wind</span>

                <strong>
                  {selectedWeather.windSpeed !=
                  null
                    ? `${selectedWeather.windSpeed.toFixed(
                        1
                      )} m/s`
                    : "--"}
                </strong>
              </div>

              <div>
                <span>Humidity</span>

                <strong>
                  {selectedWeather.humidity !=
                  null
                    ? `${selectedWeather.humidity}%`
                    : "--"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="weather-globe__loading">
            Loading...
          </div>
        )}

        {error && (
          <div className="weather-globe__error">
            {error}
          </div>
        )}
      </aside>

      <main className="weather-globe__canvas-wrap">
        <div
          ref={containerRef}
          className="weather-globe__canvas"
        />
      </main>
    </div>
  );
}