import React, { useEffect } from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate";
import AuthGuard from "./components/Login/AuthGuard";
import LoginCallback from "./components/Login/callback";
import LoginCallbackError from "./components/Login/LoginCallbackError";
import LandingPage from "./components/LandingPage";
import AskIntelliplan from "./components/askIntelliplan";
import FeatureGuard from "./components/Login/FeatureGuard";
import { checkRunRateAccess, checkAskIntelliplanAccess } from "../src/components/Login/featureAccessUtils";
import { ensureAgentToken } from "./utils/agentToken";

// NEW: public login starter that triggers oktaAuth.signInWithRedirect()
import LoginStart from "./components/Login/LoginStart";

import "./styles/global.css";

const App = () => {
  useEffect(() => {
    ensureAgentToken();
  }, []);

  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginStart />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/login/callbackError" element={<LoginCallbackError />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/runrate"
            element={
              <AuthGuard>
                <FeatureGuard checkFn={checkRunRateAccess}>
                  <SalesForecastTable />
                </FeatureGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/ask-ai"
            element={
              <AuthGuard>
                <FeatureGuard checkFn={checkAskIntelliplanAccess}>
                  <AskIntelliplan />
                </FeatureGuard>
              </AuthGuard>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;


// API_BASE_URL=http://localhost:80/api
// OKTA_URL = https://kcc.oktapreview.com
// OKTA_CLIENT_ID = 0oa2jeoztelhzt4r20h8