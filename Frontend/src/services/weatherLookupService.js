import apiClient from "../axios_service/axios.jsx";

export async function fetchWeatherBundleByCity(city) {
  const response = await apiClient.get("/services/", {
    params: { city },
  });

  return response.data;
}
