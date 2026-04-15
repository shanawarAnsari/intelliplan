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
import { Login as Person2, TrendingUp, Inventory2 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import landingBg from "../assets/landing.png";
import { useUserStore } from "../store/userStore";
import { oktaAuth } from "./Login/oktaConfig";

const CARD_WIDTH = 350;
const CARD_HEIGHT = 240;

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isUserLoading } = useUserStore();

  const features = [
    {
      title: "Demand Planning",
      description:
        "Simulate run rates and get AI-powered insights for demand forecasting.",
      icon: <TrendingUp sx={{ fontSize: 48, mb: 1 }} />,
      route: "/demand-planning",
    },
    {
      title: "Supply Planning",
      description:
        "Monitor alerts and review executive-level supply chain performance.",
      icon: <Inventory2 sx={{ fontSize: 48, mb: 1 }} />,
      route: "/supply-planning",
    },
  ];

  const handleLogin = () => {
    // Keep originalUri stable (avoid using full URL when looping)
    oktaAuth.signInWithRedirect({ originalUri: window.location.pathname });
  };

  const showLoginBanner = !isLoggedIn && !isUserLoading;

  return (
    <Box
      sx={{
        minHeight: "93vh",
        backgroundImage: `url(${landingBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pl: { xs: 2, md: 8 },
          pr: { xs: 2 },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Simulate Better, Plan Smarter!
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 6, maxWidth: 500 }}>
          Intelliplan helps you analyze and simulate supply chain performance with
          confidence.
        </Typography>
      </Box>

      {/* Cards + Login Overlay */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          mb: 12,
        }}
      >
        {showLoginBanner && (
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: -38,
              px: 3,
              py: 2,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              color: "#fff",
              border: "1.5px solid rgba(255, 255, 255, 0.28)",
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              zIndex: 3,
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.35), inset 0 0 20px rgba(255,255,255,0.18)",
              transition: "all 0.3s ease",
            }}
          >
            {/* Left Icon */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              <Person2 sx={{ fontSize: 24, color: "#fff" }} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, letterSpacing: "0.3px" }}
              >
                You’re not signed in
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.8, fontSize: "0.7rem" }}
              >
                Login to access all features
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{
                borderRadius: 3,
                px: 2.5,
                py: 0.6,
                fontWeight: 700,
                fontSize: "0.75rem",
                background: "linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)",
                color: "#000",
                textTransform: "none",
                ml: 2,
                boxShadow: "0 4px 14px rgba(255,255,255,0.45)",
                "&:hover": {
                  background: "linear-gradient(135deg, #f3f3f3 0%, #dcdcdc 100%)",
                },
              }}
            >
              Login using OKTA SSO
            </Button>
          </Paper>
        )}

        {/* Always render the grid to preserve layout height */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          // When logged out, blur and block interaction—height stays the same.
          sx={{
            mt: 3,
            transition: "filter 0.2s ease, opacity 0.2s ease",
            filter: showLoginBanner ? "blur(2px)" : "none",
            opacity: showLoginBanner ? 0.8 : 1,
            pointerEvents: showLoginBanner ? "none" : "auto",
            // Optional: reserve predictable vertical space on small screens too
            px: { xs: 2, md: 0 },
          }}
        >
          {features.map((feature, index) => (
            <Grid item key={index}>
              <Card
                sx={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  color: "#fff",
                  textAlign: "center",
                  p: 2,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                  },
                }}
              >
                {feature.icon}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ mb: 2, fontSize: "0.75rem" }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: "#fff",
                      color: "#000",
                      fontWeight: "bold",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                    onClick={() => navigate(feature.route)}
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
