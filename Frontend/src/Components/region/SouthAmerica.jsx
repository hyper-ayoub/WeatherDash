import { useState, useEffect } from "react";
import Layout from "../Layout";
import "./css/Global.css";
import Southamerica from "../../assets/images/southamerica.png";

const styles = `
.sa-root {
  font-family: 'Inter', sans-serif;
  background-image: url(${Southamerica});
  background-repeat: no-repeat;
  background-size: cover;
  color: #191c1e;
  width: 100%;
  min-height: 100vh;
}
`;

const FC_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const FC_ICONS = [
  { icon: "partly_cloudy_day", color: "#f59e0b" },
  { icon: "rainy",             color: "#60a5fa" },
  { icon: "wb_sunny",          color: "#fbbf24" },
  { icon: "wb_sunny",          color: "#fbbf24" },
  { icon: "cloud",             color: "#94a3b8" },
  { icon: "thunderstorm",      color: "#3b82f6" },
  { icon: "partly_cloudy_day", color: "#f59e0b" },
];

export default function SouthAmerica() {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);


  const loadData = () => {
    const stored = localStorage.getItem("weatherData_South America");
    if (!stored) {
      setLoading(true); // skeleton reste affiché
      return;
    }
    const sa = JSON.parse(stored);
    const { weather, forecast, image, windy_embed } = sa;

    setData({
      city:       weather.name,
      country:    weather.sys?.country,
      temp:       Math.round(weather.main.temp),
      feelsLike:  Math.round(weather.main.feels_like),
      tempMax:    Math.round(weather.main.temp_max),
      tempMin:    Math.round(weather.main.temp_min),
      humidity:   weather.main.humidity,
      pressure:   weather.main.pressure,
      windSpeed:  Math.round(weather.wind.speed * 3.6), // m/s → km/h
      visibility: Math.round(weather.visibility / 1000),
      condition:  weather.weather[0].description,
      bgImage:    image,
      windyEmbed: windy_embed + "&autoplay=1",
      forecast:   forecast.list?.slice(0, 7).map((item, i) => ({
        day:   FC_DAYS[i],
        high:  Math.round(item.main.temp_max),
        low:   Math.round(item.main.temp_min),
        label: item.weather[0].description,
        icon:  FC_ICONS[i].icon,
        color: FC_ICONS[i].color,
      })),
    });

    setLoading(false);
  };

  useEffect(() => {
    // Charge au démarrage
    loadData();
    // Recharge quand Layout envoie le signal cityChanged
    window.addEventListener("cityChanged", loadData);
    return () => window.removeEventListener("cityChanged", loadData);
  }, []);

  return (
    <Layout>
      <style>{styles}</style>
      <div className="sa-root">
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* HERO */}
          <div className="sa-hero">

            {/* Main weather card */}
            <div className="sa-main-card">
              <div className="sa-card-bg">
                {!loading && data?.bgImage
                  ? <img src={data.bgImage} alt={data.city} />
                  : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1e3a8a,#2563eb)" }} />
                }
              </div>
              <div className="sa-card-overlay" />
              <div className="sa-card-content">

                {/* Ville + heure */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    {loading
                      ? <>
                          <div className="sk-dark" style={{ width: 220, height: 36, marginBottom: 10 }} />
                          <div className="sk-dark" style={{ width: 160, height: 14 }} />
                        </>
                      : <>
                          <h1 className="sa-city">{data?.city}, {data?.country}</h1>
                          <p className="sa-time">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                            {new Date().toLocaleString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </>
                    }
                  </div>

                  {/* Badge condition */}
                  {loading
                    ? <div className="sk-dark" style={{ width: 140, height: 38, borderRadius: 999 }} />
                    : <div className="sa-cond-badge">
                        <span className="material-symbols-outlined ms-filled">partly_cloudy_day</span>
                        {data?.condition}
                      </div>
                  }
                </div>

                {/* Température */}
                <div className="sa-temp-row">
                  {loading
                    ? <>
                        <div className="sk-dark" style={{ width: 150, height: 96, borderRadius: 12 }} />
                        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                          <div className="sk-dark" style={{ width: 120, height: 14 }} />
                          <div className="sk-dark" style={{ width: 80, height: 18 }} />
                        </div>
                      </>
                    : <>
                        <div>
                          <span className="sa-temp">{data?.temp}°</span>
                          <span className="sa-unit">C</span>
                        </div>
                        <div className="sa-temp-meta">
                          <p className="sa-feels">Feels like {data?.feelsLike}°</p>
                          <div className="sa-hilo">
                            <span>
                              <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#bfdbfe" }}>arrow_upward</span>
                              {data?.tempMax}°
                            </span>
                            <span>
                              <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#bfdbfe" }}>arrow_downward</span>
                              {data?.tempMin}°
                            </span>
                          </div>
                        </div>
                      </>
                  }
                </div>
              </div>
            </div>

            {/* Side stats */}
            <div className="sa-side">
              <div className="sa-atm-card">
                <div className="sa-atm-header">
                  <h3 className="sa-atm-title">Atmospheric Health</h3>
                  <span className="sa-badge-opt">Optimal</span>
                </div>

                {/* Humidity */}
                <div className="sa-stat-row">
                  <div className="sa-stat-ico"><span className="material-symbols-outlined">humidity_low</span></div>
                  <div style={{ flex: 1 }}>
                    <p className="sa-stat-lbl">Humidity</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {loading
                        ? <div className="sk" style={{ width: 50, height: 20 }} />
                        : <span className="sa-stat-val">{data?.humidity}%</span>
                      }
                      <div className="sa-stat-bar">
                        <div className="sa-stat-fill" style={{ width: loading ? "30%" : `${data?.humidity}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wind */}
                <div className="sa-stat-row">
                  <div className="sa-stat-ico"><span className="material-symbols-outlined">air</span></div>
                  <div style={{ flex: 1 }}>
                    <p className="sa-stat-lbl">Wind Speed</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {loading
                        ? <div className="sk" style={{ width: 80, height: 20 }} />
                        : <span className="sa-stat-val">{data?.windSpeed} km/h</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Pressure */}
                <div className="sa-stat-row">
                  <div className="sa-stat-ico"><span className="material-symbols-outlined">wb_sunny</span></div>
                  <div style={{ flex: 1 }}>
                    <p className="sa-stat-lbl">Pressure</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {loading
                        ? <div className="sk" style={{ width: 100, height: 20 }} />
                        : <span className="sa-stat-val">{data?.pressure} hPa</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Precip */}
              <div className="sa-precip-card">
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p className="sa-precip-lbl">Condition</p>
                  {loading
                    ? <div className="sk-dark" style={{ width: 160, height: 26, marginTop: 6 }} />
                    : <h4 className="sa-precip-val">{data?.condition}</h4>
                  }
                </div>
                <span className="material-symbols-outlined sa-precip-ico">rainy</span>
              </div>
            </div>
          </div>

          {/* BENTO */}
          <div className="sa-bento">

            {/* Radar Windy */}
            <div className="sa-radar-card">
              <div className="sa-radar-hdr">
                <div className="sa-radar-title">
                  <span className="material-symbols-outlined">radar</span>
                  Regional Radar: {loading ? "..." : data?.city}
                </div>
                <div className="sa-radar-btns">
                  <button className="sa-radar-btn on">LIVE</button>
                  <button className="sa-radar-btn off">SATELLITE</button>
                </div>
              </div>
              <div className="sa-radar-box">
                {data?.windyEmbed && (
                  <iframe src={data.windyEmbed} title="Windy Radar" allowFullScreen />
                )}
                <div className="sa-radar-pulse" />
                <div className="sa-radar-marker">
                  <div className="sa-radar-dot" />
                  <span className="sa-radar-label">{data?.city?.toUpperCase() ?? ""}</span>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="sa-fc-card">
              <div className="sa-fc-hdr">
                <h3 className="sa-fc-title">7-Day Forecast</h3>
              </div>
              {FC_DAYS.map((day, i) => {
                const fc = data?.forecast?.[i];
                return (
                  <div key={day} className={`sa-fc-row${i === 0 ? " active" : ""}`}>
                    <span className={`sa-fc-day${i === 0 ? "" : " dim"}`}>{day}</span>
                    <div className="sa-fc-cond">
                      <span className="material-symbols-outlined ms-filled" style={{ color: loading ? "#e2e8f0" : (fc?.color ?? FC_ICONS[i].color) }}>
                        {fc?.icon ?? FC_ICONS[i].icon}
                      </span>
                      {loading
                        ? <div className="sk" style={{ width: 90, height: 14 }} />
                        : <span>{fc?.label}</span>
                      }
                    </div>
                    <div className="sa-fc-temps">
                      {loading
                        ? <div className="sk" style={{ width: 56, height: 14 }} />
                        : <>
                            <span className="sa-fc-hi">{fc?.high}°</span>
                            <span className="sa-fc-lo">{fc?.low}°</span>
                          </>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="sa-footer">
            {[
              { lbl: "Visibility", val: data?.visibility, unit: " km",  sub: "Clear horizon", border: "#00488d" },
              { lbl: "Feels Like", val: data?.feelsLike,  unit: "°C",   sub: "Apparent temp", border: "#7b3200" },
              { lbl: "Pressure",   val: data?.pressure,   unit: " hPa", sub: "Stable",        border: "#005fb8" },
              { lbl: "Wind",       val: data?.windSpeed,  unit: " km/h",sub: "Speed",         border: "#bac9d3" },
            ].map(t => (
              <div key={t.lbl} className="sa-tile" style={{ borderLeft: `4px solid ${t.border}` }}>
                <p className="sa-tile-lbl">{t.lbl}</p>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  {loading
                    ? <div className="sk" style={{ width: 80, height: 26 }} />
                    : <>
                        <span className="sa-tile-val">{t.val}{t.unit}</span>
                        {t.sub && <span className="sa-tile-sub">{t.sub}</span>}
                      </>
                  }
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}