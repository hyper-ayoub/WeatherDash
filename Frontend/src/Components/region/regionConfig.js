const REGION_CONFIG = {
  "Africa": {
    coords: { lat: 1, lon: 20 },
  },
  "Antarctica": {
    coords: { lat: -80, lon: 0 },
  },
  "Central Asia": {
    coords: { lat: 47, lon: 70 },
  },
  "East Asia": {
    coords: { lat: 35, lon: 110 },
  },
  "Europe": {
    coords: { lat: 54, lon: 15 },
  },
  "Middle East": {
    coords: { lat: 25, lon: 45 },
  },
  "North America": {
    coords: { lat: 45, lon: -100 },
  },
  "Oceania": {
    coords: { lat: -25, lon: 135 },
  },
  "South America": {
    coords: { lat: -15, lon: -60 },
  },
  "South Asia": {
    coords: { lat: 20, lon: 78 },
  },
  "Southeast Asia": {
    coords: { lat: 10, lon: 105 },
  },
};

export function getRegionDefaults(regionName) {
  const region = REGION_CONFIG[regionName] || REGION_CONFIG.Europe;
  const { lat, lon } = region.coords;

  return {
    storageKey: `weatherData_${regionName}`,
    label: regionName,
    coords: { lat, lon },
    windyEmbed: `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=4&level=surface&overlay=wind`,
  };
}