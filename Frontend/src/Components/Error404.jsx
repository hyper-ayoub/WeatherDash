import React from "react";
import './css/Error404.css'
import Cloud from "./../assets/images/Error404.gif";
const Error404 = () => {
  return (
    <>
      <div className="error-page">
        <div className="error-container">
          {/* Cloud Graphic */}
          <div className="cloud-container">
            <div className="cloud-icon">
              <img
                src={Cloud}
                alt="Lonely Cloud"
                ClAssName="cloud-image"
              />
            </div>
          </div>
          {/* Error Message */}
          <h1 className="error-title">404 - Lost in the Clouds?</h1>
          <p className="error-message">
            Oops! This forecast blew away. The page you are looking for has drifted off our radar.
          </p>
          {/* Home Button */}
          <a href="/home" className="home-button">
            <span className="home-icon">home</span>
            Return Home
          </a>

          {/* Footer */}
          <p className="footer-text">WeatherDash Atmospheric Intelligence</p>
        </div>
      </div>
    </>
  );
};

export default Error404;