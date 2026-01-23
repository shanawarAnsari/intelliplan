import React, { useEffect } from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate/index";
import "./styles/global.css";
import LandingPage from "./components/LandingPage";
import AskIntelliplan from "./components/askIntelliplan";
import { ensureAgentToken } from "./utils/agentToken";

const App = () => {
  useEffect(() => {
    ensureAgentToken();
  }, []);

  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          {/* <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/login/callbackError" element={<LoginCallbackError />} /> */}
          <Route path="/runrate" element={<SalesForecastTable />} />
          <Route path="*" element={<LandingPage />} />
          <Route path="/ask-ai" element={<AskIntelliplan />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
