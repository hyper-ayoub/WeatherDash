const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const CACHE_TTL_MS = 5 * 60 * 1000;

const responseCache = new Map();

function roundCoord(value, precision = 2) {
  return Number.parseFloat(Number(value).toFixed(precision));
}

function cacheKey(lat, lon, endpoint) {
  return `${endpoint}:${roundCoord(lat)}:${roundCoord(lon)}`;
}

function getApiKey() {
  return import.meta.env.VITE_OPENWEATHER_API_KEY || "";
}

function getUnits() {
  return import.meta.env.VITE_OPENWEATHER_UNITS || "metric";
}

function getLang() {
  return import.meta.env.VITE_OPENWEATHER_LANG || "en";
}

function toWindComponents(speedMps = 0, directionDeg = 0) {
  // OpenWeather wind direction is the bearing FROM which the wind blows.
  // Convert to a flow vector by adding 180 degrees.
  const flowHeading = ((Number(directionDeg) || 0) + 180) % 360;
  const radians = (flowHeading * Math.PI) / 180;
  const speed = Number(speedMps) || 0;

  return {
    u: -(speed * Math.sin(radians)),
    v: -(speed * Math.cos(radians)),
  };
}

function normalizeCurrentWeather(raw) {
  const wind = raw?.wind || {};
  const main = raw?.main || {};
  const coord = raw?.coord || {};
  const weather = raw?.weather?.[0] || {};
  const windComponents = toWindComponents(wind.speed, wind.deg);

  return {
    source: "openweather",
    kind: "current",
    city: raw?.name || "Unknown location",
    country: raw?.sys?.country || "",
    latitude: coord.lat ?? null,
    longitude: coord.lon ?? null,
    temperature: main.temp ?? null,
    feelsLike: main.feels_like ?? null,
    humidity: main.humidity ?? null,
    pressure: main.pressure ?? null,
    windSpeed: wind.speed ?? null,
    windDirection: wind.deg ?? null,
    windComponents,
    condition: weather.description || "Unknown",
    icon: weather.icon || null,
    visibility: raw?.visibility ?? null,
    clouds: raw?.clouds?.all ?? null,
    fetchedAt: raw?.dt ? new Date(raw.dt * 1000).toISOString() : new Date().toISOString(),
    raw,
  };
}

function normalizeForecastItem(item) {
  const wind = item?.wind || {};
  const main = item?.main || {};
  const weather = item?.weather?.[0] || {};
  const windComponents = toWindComponents(wind.speed, wind.deg);

  return {
    source: "openweather",
    kind: "forecast",
    timestamp: item?.dt ? new Date(item.dt * 1000).toISOString() : item?.dt_txt || null,
    temperature: main.temp ?? null,
    feelsLike: main.feels_like ?? null,
    humidity: main.humidity ?? null,
    pressure: main.pressure ?? null,
    windSpeed: wind.speed ?? null,
    windDirection: wind.deg ?? null,
    windComponents,
    condition: weather.description || "Unknown",
    icon: weather.icon || null,
    clouds: item?.clouds?.all ?? null,
    raw: item,
  };
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenWeather request failed (${response.status}): ${text || response.statusText}`);
  }
  return response.json();
}

function buildUrl(path, lat, lon) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing VITE_OPENWEATHER_API_KEY environment variable");
  }

  const url = new URL(`${OPENWEATHER_BASE}/${path}`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", getUnits());
  url.searchParams.set("lang", getLang());
  return url;
}

export function createWeatherSnapshot(lat, lon, payload) {
  const current = normalizeCurrentWeather(payload.current);
  const forecast = payload.forecast?.list?.map(normalizeForecastItem) || [];

  return {
    latitude: lat,
    longitude: lon,
    current,
    forecast,
    fetchedAt: new Date().toISOString(),
    provider: "openweather",
  };
}

export function formatWeatherSnapshot(snapshot) {
  if (!snapshot?.current) {
    return null;
  }

  return {
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    current: snapshot.current,
    forecast: snapshot.forecast || [],
    provider: snapshot.provider || "openweather",
  };
}

export async function fetchWeatherBundle(lat, lon, { signal } = {}) {
  const endpointKey = cacheKey(lat, lon, "bundle");
  const cached = responseCache.get(endpointKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = (async () => {
    const currentUrl = buildUrl("weather", lat, lon);
    const forecastUrl = buildUrl("forecast", lat, lon);

    const [current, forecast] = await Promise.all([
      fetchJson(currentUrl, signal),
      fetchJson(forecastUrl, signal),
    ]);

    return createWeatherSnapshot(lat, lon, { current, forecast });
  })();

  responseCache.set(endpointKey, { timestamp: Date.now(), promise });

  try {
    return await promise;
  } catch (error) {
    responseCache.delete(endpointKey);
    throw error;
  }
}

export function normalizeWindSnapshot(source) {
  if (!source) {
    return { speed: 0, direction: 0, components: { u: 0, v: 0 } };
  }

  return {
    speed: Number(source.windSpeed ?? 0),
    direction: Number(source.windDirection ?? 0),
    components: source.windComponents || toWindComponents(source.windSpeed, source.windDirection),
  };
}

export function temperatureToColor(temperature) {
  const value = Number(temperature);
  const saturationBoost = 2.35;

  if (!Number.isFinite(value)) {
    return saturateColor({ r: 88, g: 34, b: 138 }, saturationBoost);
  }

  const palette = [
    { t: -30, color: { r: 88, g: 34, b: 138 } },
    { t: -20, color: { r: 110, g: 52, b: 194 } },
    { t: -10, color: { r: 34, g: 88, b: 214 } },
    { t: 0, color: { r: 38, g: 200, b: 255 } },
    { t: 10, color: { r: 51, g: 214, b: 110 } },
    { t: 20, color: { r: 250, g: 210, b: 72 } },
    { t: 30, color: { r: 248, g: 140, b: 40 } },
    { t: 40, color: { r: 219, g: 52, b: 52 } },
  ];

  if (value <= palette[0].t) return saturateColor(palette[0].color, saturationBoost);
  if (value >= palette[palette.length - 1].t) {
    return saturateColor(palette[palette.length - 1].color, saturationBoost);
  }

  for (let i = 0; i < palette.length - 1; i += 1) {
    const current = palette[i];
    const next = palette[i + 1];
    if (value >= current.t && value <= next.t) {
      const ratio = (value - current.t) / (next.t - current.t);
      return saturateColor(
        {
          r: Math.round(current.color.r + (next.color.r - current.color.r) * ratio),
          g: Math.round(current.color.g + (next.color.g - current.color.g) * ratio),
          b: Math.round(current.color.b + (next.color.b - current.color.b) * ratio),
        },
        saturationBoost,
      );
    }
  }

  return saturateColor(palette[palette.length - 1].color, saturationBoost);
}

function saturateColor({ r, g, b }, factor) {
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToRgb(h, Math.min(1, s * factor), l);
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function temperatureLabel(temperature) {
  const value = Number(temperature);
  if (!Number.isFinite(value)) return "--";
  return `${Math.round(value)}°C`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function wrapLongitude(longitude) {
  const wrapped = ((longitude + 540) % 360) - 180;
  return wrapped;
}

export function destinationPoint(latitude, longitude, distanceKm, bearingDeg) {
  const earthRadiusKm = 6371;
  const angularDistance = distanceKm / earthRadiusKm;
  const theta = (Number(bearingDeg) * Math.PI) / 180;
  const phi1 = (Number(latitude) * Math.PI) / 180;
  const lambda1 = (Number(longitude) * Math.PI) / 180;

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(angularDistance) +
    Math.cos(phi1) * Math.sin(angularDistance) * Math.cos(theta);
  const phi2 = Math.asin(clamp(sinPhi2, -1, 1));

  const y = Math.sin(theta) * Math.sin(angularDistance) * Math.cos(phi1);
  const x = Math.cos(angularDistance) - Math.sin(phi1) * Math.sin(phi2);
  const lambda2 = lambda1 + Math.atan2(y, x);

  return {
    latitude: (phi2 * 180) / Math.PI,
    longitude: wrapLongitude((lambda2 * 180) / Math.PI),
  };
}
