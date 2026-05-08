import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../axios_service/axios";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./css/Auth.css";
export default function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password1 !== form.password2) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/signup/", {
        username: form.username,
        email: form.email,
        password: form.password1,
      });
      console.log(res.data);
      toast.success("Signup successful");
      // go to login page after success
      navigate("/signin");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Signup failed, try again");
    }
  };
  return (
      <div className="auth-page auth-page-signup">
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

        <div className="auth-shell auth-shell-wide">
          <aside className="auth-visual" aria-hidden="true">
            <p className="auth-kicker">Create Account</p>
            <h2>WeatherDash</h2>
            <p>
              Save locations, switch regions quickly, and monitor forecast
              trends in one place.
            </p>
          </aside>

          <section className="auth-panel">
            <h1>Get started</h1>
            <p className="auth-subtitle">Set up your WeatherDash account in under a minute.</p>

            <form onSubmit={handleSubmit} className="auth-form auth-grid-form">
              <div className="auth-field">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>

              <div className="auth-field auth-span-2">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="auth-field auth-span-2">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password1">Password</label>
                <input
                  id="password1"
                  type="password"
                  name="password1"
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password2">Confirm Password</label>
                <input
                  id="password2"
                  type="password"
                  name="password2"
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <label className="auth-check auth-span-2" htmlFor="terms">
                <input type="checkbox" required id="terms" />
                <span>I accept the terms and privacy policy.</span>
              </label>

              <button type="submit" className="auth-button auth-span-2">Create Account</button>

              <p className="auth-bottom-text auth-span-2">
                Already have an account? <Link to="/signin">Sign in</Link>
              </p>
            </form>
          </section>
        </div>
      </div>
  );
}
