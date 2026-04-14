import React, { useEffect, useState } from "react";
import { oktaAuth, resolveOriginalUri } from "./oktaConfig";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useUserStore } from "../../store/userStore";
import { generateApiToken } from "../../services/apiTokenGen";
import { hasValidAccess, isAdminUser } from "./accessUtils";
import { Loader } from "../../utils/Loader";

const LoginCallback = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);

  const {
    setIsLoggedIn,
    setIsUserLoading,
    setUser,
    setAuthToken,
    setIsUserAdmin,
  } = useUserStore();

  useEffect(() => {
    let alive = true;

    (async () => {
      setIsUserLoading(true);

      try {
        // 0) Ensure this is truly a login redirect. If not, bounce home.
        const isRedirect = oktaAuth.isLoginRedirect();
        if (!isRedirect) {
          navigate("/", { replace: true });
          return;
        }

        // 1) Parse tokens from the current URL and store them
        const { tokens } = await oktaAuth.token.parseFromUrl();
        oktaAuth.tokenManager.setTokens(tokens);

        // 2) Get tokens back from TokenManager for your app use
        const tm = oktaAuth.tokenManager.getTokensSync();
        const bearer = tm.accessToken?.accessToken || tm.idToken?.idToken || "";
        setAuthToken(bearer);

        // 3) Load user profile from /userinfo (requires profile/email scopes)
        const userInfo = await oktaAuth.token.getUserInfo();
        setUser(userInfo);
        if (isAdminUser(userInfo)) setIsUserAdmin(true);

        // 4) Optional: app token exchange
        if (hasValidAccess(userInfo)) {
          const { jwtApiToken } = await generateApiToken(bearer, userInfo.mygroup, userInfo.myrole);
          localStorage.setItem("authToken", jwtApiToken ?? "");
          setIsLoggedIn(true);
          setIsUserLoading(false);
        } else {
          throw new Error("ACCESS_DENIED");
        }

        // 5) Navigate to the original page (or home) using React Router
        const to = resolveOriginalUri("/");
        navigate(to, { replace: true });
      } catch (err) {
        console.error("[LoginCallback] Error:", err);
        setIsLoggedIn(false);
        setIsUserLoading(false);
        navigate("/login/callbackError", { replace: true });
      } finally {
        if (alive) setBusy(false);
      }
    })();

    return () => { alive = false; };
  }, [navigate, setAuthToken, setIsLoggedIn, setIsUserAdmin, setIsUserLoading, setUser]);

  if (busy) {
    return (
      <Loader />
    );
  }
  return null;
};

export default LoginCallback;