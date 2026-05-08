import React, { useState } from "react";
import api from "../axios_service/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./css/Auth.css";
export default function Signin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = {
        password: form.password,
      };
  
      if (form.username.includes("@")) {
        loginData.email = form.username;
      } else {
        loginData.username = form.username;
      }
      const res = await api.post("/auth/signin/", loginData);
      console.log(res.data);
      toast.success("Login successful");
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/home");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Invalid credentials,Login failed Try gain");
    }
  };

  return (
      <div className="auth-page auth-page-login">
        <nav className="auth-top-nav" aria-label="Auth navigation">
          <div className="auth-top-inner">
            <div className="auth-brand-wrap">
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
              <span className="auth-brand">WeatherDash</span>
            </div>
            <Link to="/LandingPage" className="auth-home-link">Return to Landing Page</Link>
          </div>
        </nav>

        <div className="auth-shell">
          <aside className="auth-visual" aria-hidden="true">
            <p className="auth-kicker">WeatherDash</p>
            <h2>Track weather shifts in real time.</h2>
            <p>
              From heat maps to regional insights, your forecast workspace is
              one login away.
            </p>
          </aside>

          <section className="auth-panel">
            <h1>Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue to your dashboard.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="username">Email or Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="auth-options">
                <label className="auth-check" htmlFor="remember">
                  <input
                    type="checkbox"
                    name="remember"
                    onChange={handleChange}
                    id="remember"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="auth-link-muted">Forgot password?</a>
              </div>

              <button type="submit" className="auth-button">Sign In</button>

              <p className="auth-bottom-text">
                New here? <Link to="/signup">Create an account</Link>
              </p>
            </form>
          </section>
        </div>
      </div>
  );
}
