import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import landingBg from "../assets/landing.png";
import DemandIcon from "../assets/demand.png";
import SupplyIcon from "../assets/supply.png";

import { useUserStore } from "../store/userStore";
import { oktaAuth } from "./Login/oktaConfig";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 300;

const features = [
  {
    title: "Demand Planning",
    description:
      "Forecast demand using run‑rate simulations and Intelliplan AI to drive confident decisions.",
    icon: DemandIcon,
    route: "/demand-planning",
    accent: "#6AE3FF",
  },
  {
    title: "Supply Planning",
    description:
      "Optimize inventory, capacity, and replenishment using intelligent planning models.",
    icon: SupplyIcon,
    route: "/supply-planning",
    accent: "#D7FF5C",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isUserLoading } = useUserStore();

  const showLoginBanner = !isLoggedIn && !isUserLoading;

  const handleLogin = () => {
    oktaAuth.signInWithRedirect({
      originalUri: window.location.pathname,
    });
  };

  return (
    <Box
      sx={{
        minHeight: "93vh",
        backgroundImage: `
          radial-gradient(circle at top, rgba(90,120,255,0.15), transparent 55%),
          radial-gradient(circle at bottom, rgba(20,255,160,0.12), transparent 55%),
          url(${landingBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
      }}
    >
      {/* HERO */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 3, md: 10 },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.5px" }}
        >
          Simulate Better. Plan Smarter.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ maxWidth: 520, opacity: 0.85 }}
        >
          Intelliplan helps supply‑chain teams simulate, analyze, and plan with
          AI‑powered confidence.
        </Typography>
      </Box>

      {/* CONTENT */}
      <Box sx={{ position: "relative", pb: 12 }}>
        {/* LOGIN BANNER */}
        {showLoginBanner && (
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              px: 3,
              py: 2,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              gap: 2,
              zIndex: 10,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.5), inset 0 0 16px rgba(255,255,255,0.15)",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LoginIcon />
            </Box>

            <Box>
              <Typography fontWeight={700} fontSize="0.9rem">
                You’re not signed in
              </Typography>
              <Typography fontSize="0.7rem" sx={{ opacity: 0.85 }}>
                Login to access all features
              </Typography>
            </Box>

            <Button
              onClick={handleLogin}
              sx={{
                ml: 2,
                px: 3,
                py: 0.8,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "none",
                color: "#0B0F1A",
                background:
                  "linear-gradient(135deg, #FFFFFF 0%, #DADADA 100%)",
                boxShadow: "0 4px 16px rgba(255,255,255,0.45)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F3F3F3 0%, #CFCFCF 100%)",
                },
              }}
            >
              Login with OKTA
            </Button>
          </Paper>
        )}

        {/* FEATURE CARDS */}
        <Grid
          container
          justifyContent="center"
          spacing={4}
          sx={{
            mt: 4,
            px: { xs: 2, md: 0 },
            filter: showLoginBanner ? "blur(2px)" : "none",
            opacity: showLoginBanner ? 0.75 : 1,
            pointerEvents: showLoginBanner ? "none" : "auto",
            transition: "all 0.25s ease",
          }}
        >
          {features.map((feature) => (
            <Grid item key={feature.title}>
              <Card
                sx={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: 4,
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow:
                    "0 16px 40px rgba(0,0,0,0.45), inset 0 0 18px rgba(255,255,255,0.12)",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 24px 60px ${feature.accent}55`,
                  },
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  <Box
                    component="img"
                    src={feature.icon}
                    alt={feature.title}
                    sx={{ width: 72, height: 72, mb: 2 }}
                  />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: feature.accent,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    sx={{ fontSize: "0.8rem", opacity: 0.9, mb: 3 }}
                  >
                    {feature.description}
                  </Typography>

                  <Button
                    onClick={() => navigate(feature.route)}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: "none",
                      backgroundColor: feature.accent,
                      color: "#0B0F1A",
                      "&:hover": {
                        backgroundColor: feature.accent,
                        filter: "brightness(1.1)",
                      },
                    }}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default LandingPage;