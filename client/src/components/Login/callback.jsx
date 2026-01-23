import React, { useEffect, useState } from "react";
import { oktaAuth } from "./oktaConfig";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useUserStore } from "../../store/userStore";
import { generateApiToken } from "../../services/apiTokenGen";
import { hasValidAccess, isAdminUser } from "./accessUtils";

const LoginCallback = () => {
  const navigate = useNavigate();
  const [showAccessErrorAfterDelay, setShowAccessErrorAfterDelay] = useState(false);
  const [callbackProgress, setCallbackProgress] = useState(true);

  const {
    isLoggedIn,
    setIsLoggedIn,
    isUserLoading,
    setIsUserLoading,
    setUser,
    setAuthToken,
    setIsUserAdmin,
  } = useUserStore((state) => state);

  useEffect(() => {
    setCallbackProgress(true);
    if (!isLoggedIn && !isUserLoading) {
      setIsUserLoading(true);

      oktaAuth.token.parseFromUrl()
        .then(async (res) => {
          const tokens = res.tokens;
          oktaAuth.tokenManager.setTokens(tokens);
          const token = oktaAuth.tokenManager.getTokensSync();
          const authToken = token.accessToken?.accessToken || token.idToken?.idToken || "";
          setAuthToken(authToken);

          oktaAuth.token.getUserInfo()
            .then((userResp) => {
              setUser(userResp);
              setIsLoggedIn(true);

              if (isAdminUser(userResp)) {
                setIsUserAdmin(true);
              }

              if (hasValidAccess(userResp)) {
                generateApiToken(authToken, userResp.mygroup, userResp.myrole)
                  .then((res) => {
                    localStorage.setItem('authToken', res.jwtApiToken);
                    setIsUserLoading(false);
                    setCallbackProgress(false);
                    navigate('/');
                  })
                  .catch((err) => {
                    console.error('API token generation error:', err);
                    setIsUserLoading(false);
                    setCallbackProgress(false);
                    setShowAccessErrorAfterDelay(true);
                  });
              } else {
                setIsUserLoading(false);
                setCallbackProgress(false);
                setShowAccessErrorAfterDelay(true);
              }
            })
            .catch((error) => {
              console.error("User info error:", error);
              setIsLoggedIn(false);
              setIsUserLoading(false);
              setCallbackProgress(false);
              setShowAccessErrorAfterDelay(true);
            });
        })
        .catch((err) => {
          console.error("Token parsing error:", err);
          setIsLoggedIn(false);
          setIsUserLoading(false);
          setCallbackProgress(false);
          setShowAccessErrorAfterDelay(true);
        });
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    let timer;
    if (showAccessErrorAfterDelay) {
      timer = setTimeout(() => {
        navigate("/login/callbackError");
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [showAccessErrorAfterDelay]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <CircularProgress color="primary" />
    </Box>
  );
};

export default LoginCallback;