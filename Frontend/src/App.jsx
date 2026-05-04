import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
export default function App() {
  return (
    <BrowserRouter>
    <>
    {/* Toast Container */}
      <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
     {/*chatbot Wedghy */}
       <Wedghy/>
      <Routes>
        {/* Redirect */}
        <Route path="/" element={<Navigate to="/LandingPage" />} />

        {/* Main pages */}
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/home" element={<Home />} />

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
    </BrowserRouter>
  );
}