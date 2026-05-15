import apiClient from "../axios_service/axios.jsx";

export async function fetchWeatherBundleByCity(city, regionName) {
  const isAntarctica = regionName === "Antarctica";
  const response = await apiClient.get(isAntarctica ? "/antarctica/" : "/services/", {
    params: isAntarctica ? { city } : { city },
  });

  return response.data;
}
