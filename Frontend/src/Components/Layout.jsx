import { useNavigate, Link, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import './css/Layout.css';
import SearchBar from "./search/SearchBar";
import { REGIONS, getRegionNameFromPath } from "./region/regionNavigation";
import { fetchWeatherBundleByCity } from "../services/weatherLookupService";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials = (user.username || "U").charAt(0).toUpperCase();

  const selectedRegion = getRegionNameFromPath(location.pathname);
  const shouldPreserveCurrentRegion =
    selectedRegion && selectedRegion !== "Home" && selectedRegion !== "Globe";

  const handleCitySelect = async (suggestion) => {
    try {
      const data = await fetchWeatherBundleByCity(suggestion.searchLabel, selectedRegion);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const storageRegion = shouldPreserveCurrentRegion ? selectedRegion : data.region;

      localStorage.setItem("weatherData_" + storageRegion, JSON.stringify(data));

      const routes = {
        "Africa": "/africa",
        "Europe": "/europe",
        "North America": "/north-america",
        "South America": "/south-america",
        "Middle East": "/middle-east",
        "South Asia": "/south-asia",
        "Southeast Asia": "/southeast-asia",
        "East Asia": "/east-asia",
        "Central Asia": "/central-asia",
        "Oceania": "/oceania",
        "Antarctica": "/antarctica"
      };

      const targetRoute = routes[data.region];

      if (!shouldPreserveCurrentRegion) {
        if (!targetRoute) {
          throw new Error(`Unsupported region returned by the weather service: ${data.region}`);
        }

        navigate(targetRoute, { state: { fromSearch: true } });
      }

      window.dispatchEvent(new Event("cityChanged"));
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Unable to load weather data.");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleRegionSelect = (event, regionName, path) => {
    if (regionName === "Home") return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("regionFocusChanged", { detail: { regionName } }));
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  };

  return (
    <>
      <div className="wd-app">
      <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
        {/* Header */}
        <header className="wd-header">
          <div className="wd-header-logo">
            <div className="wd-header-icon">
              <span className="material-symbols-outlined wd-icon-sm">cloud</span>
            </div>
            <span className="wd-header-title">WeatherDash</span>
          </div>
          <div className="wd-search-area">
            <SearchBar regionName={selectedRegion} onSelectSuggestion={handleCitySelect} />
          </div>
          <div className="wd-header-actions">
            <button className="wd-icon-btn">
              <span className="material-symbols-outlined wd-icon-md">notifications</span>
            </button>
            <button className="wd-icon-btn">
              <span className="material-symbols-outlined wd-icon-md">settings</span>
            </button>
            <button className="wd-logout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined wd-icon-sm">logout</span>
              Logout
            </button>
            <div className="wd-avatar">{initials}</div>
          </div>
        </header>
        <div className="wd-body">

          {/* Sidebar */}
          <aside className="wd-sidebar">
            <div className="wd-sidebar-header">
              <h2 className="wd-sidebar-title">Welcome, {user.username || "User"}</h2>
              <p className="wd-sidebar-sub">Regional Intelligence</p>
            </div>

            <nav className="wd-nav">
              {REGIONS.map((w) => (
                <Link
                  key={w.name}
                  to={w.path}
                  className={`wd-nav-item${location.pathname === w.path ? " active" : ""}`}
                  onClick={(event) => handleRegionSelect(event, w.name, w.path)}
                >
                  <span className="material-symbols-outlined wd-icon-sm">{w.icon}</span>
                  {w.name}
                </Link>
              ))}
            </nav>

            <div className="wd-sidebar-footer">
              <a href="#" className="wd-footer-link">
                <span className="material-symbols-outlined" style={{fontSize:16}}>help_outline</span>
                Help
              </a>
              <a href="#" className="wd-footer-link">
                <span className="material-symbols-outlined" style={{fontSize:16}}>contact_support</span>
                Support
              </a>
            </div>
          </aside>

          {/* Page content goes here */}
          <main className="wd-main">
            {children}
          </main>

        </div>
      </div>
    </>
  );
}