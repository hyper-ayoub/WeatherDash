import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

import Signup from "./Components/Signup.jsx";
import Signin from "./Components/Signin.jsx";
import Home from "./Components/Home.jsx";
import LandingPage from "./Components/LandingPage.jsx";
import Wedghy from "./Components/chatbot.jsx";
// Region pages
import Africa from "./Components/region/Africa";
import Europe from "./Components/region/Europe";
import Antarctica from "./Components/region/Antarctica";
import CentralAsia from "./Components/region/CentralAsia";
import EastAsia from "./Components/region/EastAsia";
import MiddleEast from "./Components/region/MiddleEast";
import NorthAmerica from "./Components/region/NorthAmerica";
import Oceania from "./Components/region/Oceania";
import SouthAmerica from "./Components/region/SouthAmerica";
import SouthAsia from "./Components/region/SouthAsia";
import SoutheastAsia from "./Components/region/SoutheastAsia";
import Error404 from "./Components/Error404.jsx";
const WeatherGlobe = lazy(() => import("./Components/weather-globe/weatherGlobe.jsx"));

function AppContent() {
  const { pathname } = useLocation();
  const chatbotPaths = new Set([
    "/home",
    "/africa",
    "/europe",
    "/north-america",
    "/south-america",
    "/middle-east",
    "/south-asia",
    "/southeast-asia",
    "/east-asia",
    "/central-asia",
    "/oceania",
    "/antarctica",
  ]);
  const showChatbot = chatbotPaths.has(pathname);

  return (
    <Suspense fallback={<div style={{ padding: 24, color: "#fff" }}>Loading application...</div>}>
      <>
      {/* Toast Container */}
        <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="colored"
          />
       {/*chatbot Wedghy */}
        {showChatbot && <Wedghy />}
        <Routes>
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/LandingPage" />} />

          {/* Main pages */}
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/globe" element={<WeatherGlobe />} />

          {/* Region pages */}
          <Route path="/africa" element={<Africa />} />
          <Route path="/europe" element={<Europe />} />
          <Route path="/north-america" element={<NorthAmerica />} />
          <Route path="/south-america" element={<SouthAmerica />} />
          <Route path="/middle-east" element={<MiddleEast />} />
          <Route path="/south-asia" element={<SouthAsia />} />
          <Route path="/southeast-asia" element={<SoutheastAsia />} />
          <Route path="/east-asia" element={<EastAsia />} />
          <Route path="/central-asia" element={<CentralAsia />} />
          <Route path="/oceania" element={<Oceania />} />
          <Route path="/antarctica" element={<Antarctica />} />
          {/* Error 404 */}
          <Route path="/*" element={<Error404 />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}