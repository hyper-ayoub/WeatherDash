import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {Routes as Switch, Navigate as Redirect, Link, useLocation} from 'react-router-dom';
import Signup from "./Components/Signup.jsx";
import Signin from "./Components/Signin.jsx";
import Home from "./components/Home";
import LandingPage from "./Components/LandingPage";

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
      < Route path="/" element={<Redirect to="/LandingPage" />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}