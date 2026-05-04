import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  .wd-app { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #60a5fa 100%); min-height: 100vh; color: #fff; overflow: hidden; }
  .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; vertical-align: middle; }
  .ms-filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); }

  @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
  .sk { background: linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.05) 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; border-radius: 8px; display: inline-block; }

  .wd-header { width: 100%; height: 72px; position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.10); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
  .wd-header-logo { display: flex; align-items: center; gap: 12px; }
  .wd-header-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.10); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .wd-header-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: -0.3px; }
  .wd-header-actions { display: flex; align-items: center; gap: 8px; }
  .wd-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,0.80); display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
  .wd-icon-btn:hover { background: rgba(255,255,255,0.10); }
  .wd-logout-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
  .wd-logout-btn:hover { background: rgba(255,255,255,0.20); }
  .wd-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.10); margin-left: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px; }

  .wd-body { display: flex; height: calc(100vh - 72px); }

  .wd-sidebar { width: 272px; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.10); background: rgba(0,0,0,0.05); backdrop-filter: blur(12px); padding-top: 32px; }
  .wd-sidebar-header { padding: 0 32px 32px; }
  .wd-sidebar-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 18px; letter-spacing: -0.2px; }
  .wd-sidebar-sub { color: rgba(255,255,255,0.40); font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 6px; }
  .wd-nav { flex: 1; overflow-y: auto; padding: 0 16px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.10) transparent; }
  .wd-nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: rgba(255,255,255,0.60); font-size: 14px; text-decoration: none; cursor: pointer; border: none; background: transparent; width: 100%; transition: color 0.2s, background 0.2s; margin-bottom: 4px; }
  .wd-nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
  .wd-sidebar-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.05); }
  .wd-footer-link { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-radius: 8px; color: rgba(255,255,255,0.40); font-size: 12px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
  .wd-footer-link:hover { color: #fff; }

  .wd-main { flex: 1; overflow-y: auto; padding: 40px; display: flex; flex-direction: column; gap: 32px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.10) transparent; }

  .wd-hero-card { border-radius: 32px; min-height: 340px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; }
  .wd-hero-bg { position: absolute; inset: 0; z-index: 0; }
  .wd-hero-bg img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wd-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top right, rgba(0,30,100,0.75), rgba(0,0,0,0.15)); }
  .wd-hero-content { position: relative; z-index: 1; }
  .wd-hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .wd-hero-city { font-family: 'Manrope', sans-serif; font-size: 32px; font-weight: 800; color: #fff; }
  .wd-hero-sub { color: #bfdbfe; font-size: 13px; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
  .wd-hero-badge { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25); border-radius: 999px; padding: 8px 16px; display: flex; align-items: center; gap: 8px; color: #fff; font-weight: 600; font-size: 14px; }
  .wd-hero-bottom { display: flex; align-items: flex-end; gap: 20px; }
  .wd-hero-temp { font-family: 'Manrope', sans-serif; font-size: 100px; font-weight: 800; color: #fff; line-height: 1; letter-spacing: -4px; }
  .wd-hero-unit { font-size: 28px; font-weight: 300; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
  .wd-hero-meta { margin-bottom: 16px; }
  .wd-hero-feels { color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; }
  .wd-hero-hilo { display: flex; gap: 16px; margin-top: 6px; }
  .wd-hero-hilo span { color: #fff; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 4px; }
  .wd-loc-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.15); border-radius: 999px; padding: 4px 10px; font-size: 12px; color: #bfdbfe; margin-top: 6px; }

  .wd-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .wd-metric-card { border-radius: 20px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .wd-metric-top { display: flex; align-items: center; justify-content: space-between; }
  .wd-metric-title { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 14px; color: rgba(255,255,255,0.80); }
  .wd-metric-icon { color: rgba(255,255,255,0.30); font-size: 20px; }
  .wd-metric-val { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; color: #fff; }
  .wd-metric-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.10); border-radius: 999px; overflow: hidden; }
  .wd-metric-bar-fill { height: 100%; background: rgba(255,255,255,0.40); border-radius: 999px; transition: width 0.6s; }

  .wd-bento { display: grid; grid-template-columns: 7fr 5fr; gap: 24px; }

  .wd-radar-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; }
  .wd-radar-title { font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .wd-radar-box { flex: 1; min-height: 280px; border-radius: 12px; overflow: hidden; position: relative; }
  .wd-radar-box iframe { width: 100%; height: 100%; border: none; min-height: 280px; display: block; }
  .wd-radar-marker { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; z-index: 10; pointer-events: none; }
  .wd-radar-dot { width: 12px; height: 12px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 4px rgba(239,68,68,0.3); }
  .wd-radar-label { background: rgba(0,0,0,0.7); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap; }

  .wd-fc-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 24px; }
  .wd-fc-title { font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 16px; }
  .wd-fc-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 8px; border-radius: 10px; transition: background 0.15s; }
  .wd-fc-row:hover { background: rgba(255,255,255,0.05); }
  .wd-fc-row.active { background: rgba(255,255,255,0.10); }
  .wd-fc-day { width: 40px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 13px; }
  .wd-fc-day.dim { opacity: 0.5; }
  .wd-fc-cond { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; flex: 1; }
  .wd-fc-temps { display: flex; gap: 12px; }
  .wd-fc-hi { font-weight: 700; font-size: 13px; }
  .wd-fc-lo { opacity: 0.5; font-size: 13px; }
  .sa-footer { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
@media(max-width:768px){ .sa-footer { grid-template-columns: repeat(2,1fr); } }
.sa-tile { background: #fff; padding: 24px; border-radius: 12px; }
.sa-tile-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 8px; }
.sa-tile-val { font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 700; }
.sa-tile-sub { font-size: 12px; color: #64748b; font-weight: 500; margin-left: 6px; }

 /* ── RESPONSIVE ────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .wd-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .wd-bento { grid-template-columns: 1fr; }
    .wd-sidebar { width: 220px; }
  }

  @media (max-width: 768px) {
    .wd-header { padding: 0 16px; }
    .wd-header-title { font-size: 16px; }
    .wd-logout-btn span:last-child { display: none; }

    .wd-body { flex-direction: column; height: auto; }

    .wd-sidebar {
      width: 100%; height: auto; flex-direction: row;
      border-right: none; border-bottom: 1px solid rgba(255,255,255,0.10);
      padding-top: 0; overflow-x: auto;
    }
    .wd-sidebar-header { display: none; }
    .wd-nav { display: flex; flex-direction: row; padding: 8px; gap: 4px; overflow-x: auto; }
    .wd-nav-item { flex-direction: column; gap: 4px; padding: 8px 12px; font-size: 11px; min-width: 70px; text-align: center; margin-bottom: 0; }
    .wd-sidebar-footer { display: none; }
    
    .wd-hero-card { min-height: 240px; padding: 24px; border-radius: 20px; }
    .wd-hero-city { font-size: 22px; }
    .wd-hero-temp { font-size: 64px; }
    .wd-hero-unit { font-size: 20px; }

    .wd-metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .wd-bento { grid-template-columns: 1fr; gap: 16px; }

    .wd-radar-box { min-height: 200px; }
    .wd-radar-box iframe { min-height: 200px; }
  }

  @media (max-width: 480px) {
    .wd-metrics-grid { grid-template-columns: 1fr 1fr; }
    .wd-hero-temp { font-size: 52px; }
    .wd-hero-city { font-size: 18px; }
    .wd-hero-card { padding: 16px; }
    .wd-metric-val { font-size: 20px; }
  }
`;

const FC_DAYS  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const FC_ICONS = ["wb_sunny","partly_cloudy_day","cloud","rainy","wb_sunny","cloudy_snowing","storm"];


export default function Home() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user")) || {};
  const initials = (user.username || "U").charAt(0).toUpperCase();

  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);
  const [geoErr, setGeoErr]   = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (!navigator.geolocation) { setGeoErr(true); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const geoRes  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const geoData = await geoRes.json();
          const city    = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Casablanca";
          const res     = await fetch(`http://127.0.0.1:8000/api/services/?city=${encodeURIComponent(city)}`);
          const d       = await res.json();
          if (!d.error) {
            setData({ weather: d.weather, forecast: d.forecast, image: d.image, windy_embed: d.windy_embed });
          } else { setGeoErr(true); }
        } catch { setGeoErr(true); }
        setLoading(false);
      },
      () => { setGeoErr(true); setLoading(false); }
    );
  }, []);

  const w        = data?.weather;
  const fc       = data?.forecast?.list ?? [];
  const windyUrl = data?.windy_embed ? data.windy_embed + "&autoplay=1" : null;

  return (
    <>
      <style>{styles}</style>
      <div className="wd-app">

        {/* Header */}
        <header className="wd-header">
          <div className="wd-header-logo">
            <div className="wd-header-icon">
              <span className="material-symbols-outlined" style={{fontSize:20}}>cloud</span>
            </div>
            <span className="wd-header-title">WeatherDash</span>
          </div>
          <div className="wd-header-actions">
            <button className="wd-icon-btn"><span className="material-symbols-outlined" style={{fontSize:22}}>notifications</span></button>
            <button className="wd-icon-btn"><span className="material-symbols-outlined" style={{fontSize:22}}>settings</span></button>
            <button className="wd-logout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined" style={{fontSize:16}}>logout</span>Logout
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
              {regions.map((r) => (
                <Link key={r.name} to={r.path} className="wd-nav-item" style={{textDecoration:"none"}}>
                  <span className="material-symbols-outlined" style={{fontSize:20}}>{r.icon}</span>
                  {r.name}
                </Link>
              ))}
            </nav>
            <div className="wd-sidebar-footer">
              <a href="#" className="wd-footer-link"><span className="material-symbols-outlined" style={{fontSize:16}}>help_outline</span>Help</a>
              <a href="#" className="wd-footer-link"><span className="material-symbols-outlined" style={{fontSize:16}}>contact_support</span>Support</a>
            </div>
          </aside>

          {/* Main */}
          <main className="wd-main">

            {/* HERO */}
            <div className="glass wd-hero-card">
              {!loading && data?.image && (
                <><div className="wd-hero-bg"><img src={data.image} alt={w?.name} /></div><div className="wd-hero-overlay" /></>
              )}
              <div className="wd-hero-content">
                <div className="wd-hero-top">
                  <div>
                    {loading ? (
                      <><div className="sk" style={{width:200,height:36,marginBottom:10}} /><div className="sk" style={{width:140,height:14}} /></>
                    ) : geoErr ? (
                      <div>
                        <h1 className="wd-hero-city">WeatherDash</h1>
                        <p className="wd-hero-sub"><span className="material-symbols-outlined" style={{fontSize:13}}>location_off</span>Enable location to see your weather</p>
                      </div>
                    ) : (
                      <div>
                        <h1 className="wd-hero-city">{w?.name}, {w?.sys?.country}</h1>
                        <div className="wd-loc-badge"><span className="material-symbols-outlined" style={{fontSize:13}}>my_location</span>Your location</div>
                        <p className="wd-hero-sub"><span className="material-symbols-outlined" style={{fontSize:13}}>schedule</span>{new Date().toLocaleString("en-US", {weekday:"long", hour:"2-digit", minute:"2-digit"})}</p>
                      </div>
                    )}
                  </div>
                  {loading ? (
                    <div className="sk" style={{width:140,height:38,borderRadius:999}} />
                  ) : !geoErr && w && (
                    <div className="wd-hero-badge">
                     <span className="material-symbols-outlined ms-filled">
                              {FC_ICONS[0]}
                      </span>
                      {w.weather?.[0]?.description}
                    </div>
                  )}
                </div>
                <div className="wd-hero-bottom">
                  {loading ? (
                    <><div className="sk" style={{width:160,height:100,borderRadius:12}} /><div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:8}}><div className="sk" style={{width:120,height:14}} /><div className="sk" style={{width:80,height:16}} /></div></>
                  ) : geoErr ? (
                    <div style={{display:"flex",alignItems:"center",gap:16,padding:"20px 0"}}>
                      <span className="material-symbols-outlined" style={{fontSize:64,color:"rgba(255,255,255,0.2)"}}>cloud_queue</span>
                      <p style={{color:"rgba(255,255,255,0.4)",fontSize:16}}>Search for a city in a region to see weather data</p>
                    </div>
                  ) : w && (
                    <>
                      <div><span className="wd-hero-temp">{Math.round(w.main?.temp)}°</span><span className="wd-hero-unit">C</span></div>
                      <div className="wd-hero-meta">
                        <p className="wd-hero-feels">Feels like {Math.round(w.main?.feels_like)}°</p>
                        <div className="wd-hero-hilo">
                          <span><span className="material-symbols-outlined" style={{fontSize:13,color:"#bfdbfe"}}>arrow_upward</span>{Math.round(w.main?.temp_max)}°</span>
                          <span><span className="material-symbols-outlined" style={{fontSize:13,color:"#bfdbfe"}}>arrow_downward</span>{Math.round(w.main?.temp_min)}°</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* METRICS */}
            <div className="wd-metrics-grid">
              {[
                { title:"Humidity",   icon:"water_drop", val:`${w?.main?.humidity}%`,                          bar: w?.main?.humidity },
                { title:"Wind Speed", icon:"air",        val:`${Math.round((w?.wind?.speed??0)*3.6)} km/h`,    bar: null },
                { title:"Pressure",   icon:"compress",   val:`${w?.main?.pressure} hPa`,                       bar: null },
                { title:"Visibility", icon:"visibility", val:`${Math.round((w?.visibility??0)/1000)} km`,      bar: null },
              ].map((m) => (
                <div key={m.title} className="glass wd-metric-card">
                  <div className="wd-metric-top">
                    <span className="wd-metric-title">{m.title}</span>
                    <span className="material-symbols-outlined wd-metric-icon">{m.icon}</span>
                  </div>
                  {loading ? <div className="sk" style={{width:80,height:28}} /> : <span className="wd-metric-val">{m.val ?? "--"}</span>}
                  {m.bar != null && <div className="wd-metric-bar"><div className="wd-metric-bar-fill" style={{width: loading ? "30%" : `${m.bar}%`}} /></div>}
                </div>
              ))}
            </div>

            {/* BENTO */}
            <div className="wd-bento">

              {/* Radar */}
              <div className="wd-radar-card">
                <div className="wd-radar-title">
                  <span className="material-symbols-outlined">radar</span>
                  Live Radar — {loading ? "..." : w?.name ?? "Your Location"}
                </div>
                <div className="wd-radar-box">
                  {windyUrl && <iframe src={windyUrl} title="Windy" allowFullScreen />}
                  {loading && <div className="sk" style={{width:"100%",height:"280px",borderRadius:12}} />}
                  {!loading && w && (
                    <div className="wd-radar-marker">
                      <div className="wd-radar-dot" />
                      <span className="wd-radar-label">{w?.name?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Forecast */}
              <div className="wd-fc-card">
                <div className="wd-fc-title">7-Day Forecast</div>
                {FC_DAYS.map((day, i) => {
                  const item = fc[i];
                  return (
                    <div key={day} className={`wd-fc-row${i===0?" active":""}`}>
                      <span className={`wd-fc-day${i===0?"":" dim"}`}>{day}</span>
                      <div className="wd-fc-cond">
                      <span className="material-symbols-outlined ms-filled" style={{fontSize:18,color:"#60a5fa"}}>
                      {loading
                        ? FC_ICONS[i]
                          : FC_ICONS[i] || "cloud"}
                        </span>
                        {loading ? <div className="sk" style={{width:80,height:14}} /> : <span>{item?.weather?.[0]?.description ?? "--"}</span>}
                      </div>
                      <div className="wd-fc-temps">
                        {loading ? <div className="sk" style={{width:50,height:14}} /> : (
                          <><span className="wd-fc-hi">{item ? Math.round(item.main?.temp_max) : "--"}°</span><span className="wd-fc-lo">{item ? Math.round(item.main?.temp_min) : "--"}°</span></>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}