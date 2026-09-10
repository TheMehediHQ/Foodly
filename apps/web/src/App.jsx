import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import "./App.css";
import Footer from "./Components/Footer";

import { useEffect } from "react";
import DarkModeSidebar from "./Components/DarkModeSidebar";
import BackToTop from "./Components/BackToTop";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Navbar />
      <DarkModeSidebar />
      <BackToTop />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
