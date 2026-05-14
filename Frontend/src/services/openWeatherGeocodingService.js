import { getRegionCountries } from "../Components/search/regionCountries";

const GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/direct";
const DEFAULT_LIMIT = 8;

function normalizeSuggestion(place) {
  const city = place.name?.trim();
  const state = place.state?.trim() || "";
  const country = place.country?.trim().toUpperCase() || "";

  if (!city || !country) {
    return null;
  }

  const searchLabel = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

  return {
    id: `${city}-${state || "no-state"}-${country}-${place.lat}-${place.lon}`,
    name: city,
    state,
    country,
    lat: place.lat,
    lon: place.lon,
    displayLabel: searchLabel,
    searchLabel,
  };
}

function scoreSuggestion(suggestion, query) {
  const normalizedName = suggestion.name.toLowerCase();

  if (normalizedName === query) {
    return 0;
  }

  if (normalizedName.startsWith(query)) {
    return 1;
  }

  return 2;
}

export async function searchCitySuggestions(query, regionName, options = {}) {
  const trimmedQuery = query.trim();
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim();
  const limit = options.limit || DEFAULT_LIMIT;

  if (!apiKey || trimmedQuery.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: String(limit),
    appid: apiKey,
  });

  const response = await fetch(`${GEOCODING_URL}?${params.toString()}`, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error("Unable to fetch city suggestions.");
  }

  const cities = await response.json();
  const allowedCountries = getRegionCountries(regionName);
  const allowedCountrySet = allowedCountries.length ? new Set(allowedCountries) : null;
  const normalizedQuery = trimmedQuery.toLowerCase();

  return cities
    .map(normalizeSuggestion)
    .filter((suggestion) => suggestion && (!allowedCountrySet || allowedCountrySet.has(suggestion.country)))
    .sort((left, right) => {
      const scoreDelta = scoreSuggestion(left, normalizedQuery) - scoreSuggestion(right, normalizedQuery);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return left.displayLabel.localeCompare(right.displayLabel);
    })
    .slice(0, limit);
}
