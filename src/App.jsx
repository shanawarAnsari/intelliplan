import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate/index"
import AuthGuard from "./components/Login/AuthGuard";
import LoginCallback from "./components/Login/callback";
import LoginCallbackError from "./components/Login/LoginCallbackError";
import "./styles/global.css";
import LandingPage from "./components/LandingPage";
import AskIntelliplan from "./components/askIntelliplan";

const App = () => {
  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/login/callbackError" element={<LoginCallbackError />} />
          {/* <Route path="/runrate" element={<SalesForecastTable />} />
          <Route path="*" element={<SalesForecastTable />} /> */}
          <Route path="/runrate" element={<AuthGuard><SalesForecastTable /></AuthGuard>} />
          <Route path="*" element={<AuthGuard><LandingPage /></AuthGuard>} />
          <Route path="/ask-ai" element={<AuthGuard><AskIntelliplan /></AuthGuard>} />

        </Routes>
      </Router>
    </ThemeProviderWrapper >
  );
}

export default App;
