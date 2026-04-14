import React, { useEffect, useState } from 'react';
import { oktaAuth, setOriginalUri } from './oktaConfig';
import { useUserStore } from '../../store/userStore';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader } from '../../utils/Loader';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, isUserLoading } = useUserStore();

  const [checking, setChecking] = useState(true);
  const [shouldRedirectHome, setShouldRedirectHome] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // If global store already says logged in, stop checking.
        if (isLoggedIn) {
          if (!cancelled) setChecking(false);
          return;
        }

        // Only query Okta when store has settled (not loading)
        const authn = await oktaAuth.isAuthenticated();

        if (cancelled) return;

        if (authn) {
          // Okta says authenticated → allow rendering; store will catch up.
          setChecking(false);
        } else {
          // Not authenticated → remember path and prepare redirect to HOME
          setOriginalUri(location.pathname); // keep only the SPA path
          setShouldRedirectHome(true);
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          setOriginalUri(location.pathname);
          setShouldRedirectHome(true);
          setChecking(false);
        }
      }
    }
    if (isUserLoading) {
      setChecking(true);
      return;
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isUserLoading, location.pathname]);

  if (checking) return <Loader />;

  // Final decision: if unauthenticated, go HOME instead of showing a blank
  if (shouldRedirectHome || !isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
