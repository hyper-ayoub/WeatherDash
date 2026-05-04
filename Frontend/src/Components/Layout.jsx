import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import './css/Layout.css';

const regions = [
  { name: "Africa",         icon: "public",                  path: "/africa" },
  { name: "Europe",         icon: "euro_symbol",             path: "/europe" },
  { name: "North America",  icon: "map",                     path: "/north-america" },
  { name: "South America",  icon: "terrain",                 path: "/south-america" },
  { name: "Middle East",    icon: "wb_sunny",                path: "/middle-east" },
  { name: "South Asia",     icon: "filter_drama",            path: "/south-asia" },
  { name: "Southeast Asia", icon: "umbrella",                path: "/southeast-asia" },
  { name: "East Asia",      icon: "temp_preferences_custom", path: "/east-asia" },
  { name: "Central Asia",   icon: "landscape",               path: "/central-asia" },
  { name: "Oceania",        icon: "waves",                   path: "/oceania" },
  { name: "Antarctica",     icon: "ac_unit",                 path: "/antarctica" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials = (user.username || "U").charAt(0).toUpperCase();
  const [searchCity, setSearchCity] = useState("");
  const handleSearch = async(w) => {
    if (w.key !== "Enter" || !searchCity.trim()) return;
    try {
      const isStation = searchCity.toLowerCase().includes("station") || searchCity.toLowerCase().includes("antarctica");
      const result = await fetch(isStation
        ? `http://127.0.0.1:8000/api/antarctica/?station=${encodeURIComponent(searchCity)}`
        : `http://127.0.0.1:8000/api/services/?city=${encodeURIComponent(searchCity)}`);
      const data = await result.json();
      if (data.error) return  toast.error(data.error);
      localStorage.setItem("weatherData_" + data.region, JSON.stringify(data));
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
      }
      navigate(routes[data.region]);
      window.dispatchEvent(new Event("cityChanged"));
    } catch (error) {
      console.log(error);
    }
  }
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
              <span className="material-symbols-outlined" style={{fontSize:20}}>cloud</span>
            </div>
            <span className="wd-header-title">WeatherDash</span>
          </div>
           <div className="wd-search-wrap">
            <span className="material-symbols-outlined wd-search-icon">search</span>
            <input
  className="wd-search"
  type="text"
  placeholder="Search for a city..."
  value={searchCity}
  onChange={(e) => setSearchCity(e.target.value)}
  onKeyDown={handleSearch}
/>
          </div>
          <div className="wd-header-actions">
            <button className="wd-icon-btn">
              <span className="material-symbols-outlined" style={{fontSize:22}}>notifications</span>
            </button>
            <button className="wd-icon-btn">
              <span className="material-symbols-outlined" style={{fontSize:22}}>settings</span>
            </button>
            <button className="wd-logout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined" style={{fontSize:16}}>logout</span>
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
              {regions.map((w) => (
                <Link key={w.name} to={w.path} className="wd-nav-item" style={{textDecoration:"none"}}>
                  <span className="material-symbols-outlined" style={{fontSize:20}}>{w.icon}</span>
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