import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { oktaAuth } from "./oktaConfig";
import { useUserStore } from "../../store/userStore";
import { Box, CircularProgress } from "@mui/material";
import LoginCallbackError from "./LoginCallbackError";
import { hasValidAccess } from "./accessUtils";

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const authToken = useUserStore((state) => state.authToken);
  const user = useUserStore((state) => state.user);
  const isUserLoading = useUserStore((state) => state.isUserLoading);
  useEffect(() => {
    let isMounted = true;

    if (
      !authToken &&
      !isLoggedIn &&
      !isUserLoading &&
      !location.pathname.includes("/login/callback") &&
      !isRedirecting
    ) {
      setIsRedirecting(true);
      oktaAuth.token.getWithRedirect({
        responseType: ["token", "id_token"],
        state: "defaultrandomstring",
        scopes: ["openid", "profile", "email", "groups"],
        prompt: "login",
      });
    }

    return () => {
      isMounted = false;
    };
  }, [location, isLoggedIn, authToken, isUserLoading, isRedirecting]);

  if (isUserLoading || isRedirecting || (!isLoggedIn && !authToken)) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  let authTokenlocal = localStorage.getItem("authToken")
  if (!authTokenlocal && isLoggedIn && !location.pathname.includes("/login/callback")) {

    // Remove all localStorage keys except authToken
    Object.keys(localStorage).forEach(key => {
      if (key !== 'authToken') {
        localStorage.removeItem(key);
      }
    });

    return <LoginCallbackError />;
  }

  if (!hasValidAccess(user) && isLoggedIn) {
    return <LoginCallbackError />;
  }

  return children;
};

export default AuthGuard;
