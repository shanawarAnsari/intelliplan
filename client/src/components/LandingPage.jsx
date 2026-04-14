import React from "react";
import { Box, Typography, Button, Chip, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import LoginIcon from "@mui/icons-material/Login";
import Paper from "@mui/material/Paper";

import landingBg from "../assets/landing.png";
import Logo from "../assets/Intelliplan-logo.png";
import KCLogo from "../assets/KC_logo_for_dark.png";
import DemandIcon from "../assets/demand.png";
import SupplyIcon from "../assets/supply.png";

const BRAND = "#1B938A";
const BRAND2 = "#6AE3FF";

const stats = [
  { value: "10x", label: "Faster Simulations" },
  { value: "Real-time", label: "AI Insights" },
  { value: "85%", label: "Alert Resolution Rate" },
  { value: "40%", label: "Leftover Stock Reduction" },
  { value: "3x", label: "Faster STO Decisions" },
];

const domains = [
  {
    title: "Demand Planning",
    description:
      "Forecast demand with AI-powered run-rate simulations. Access the Run Rate Simulator and Ask Intelliplan AI agent to drive confident, data-backed decisions.",
    imgIcon: DemandIcon,
    accent: "#6AE3FF",
    route: "/demand-planning",
    badge: "AI + Simulation",
    modules: ["Run Rate Simulator", "Ask Intelliplan AI"],
  },
  {
    title: "Supply Planning",
    description:
      "Optimize your supply network with intelligent alert management, leftover inventory optimization, and STO scheduling tools.",
    imgIcon: SupplyIcon,
    accent: "#A78BFA",
    route: "/supply-planning",
    badge: "Inventory + Logistics",
    modules: ["Alert Prioritization", "Leftover Optimization", "STO Cancel/Push"],
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  // const { isLoggedIn, isUserLoading } = useUserStore();
  // const showLoginBanner = !isLoggedIn && !isUserLoading;
  // const handleLogin = () => { oktaAuth.signInWithRedirect({ originalUri: window.location.pathname }); };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 56px)",
        bgcolor: "#04111e",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          minHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: { xs: 3, md: 6 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${landingBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,147,138,0.28) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(106,227,255,0.12) 0%, transparent 60%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "6%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(27,147,138,0.15) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "8%",
            right: "5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <Chip
            icon={
              <AutoAwesomeRoundedIcon
                sx={{ fontSize: "0.85rem !important", color: BRAND2 }}
              />
            }
            label="Demand & Supply Intelligence · Powered by AI"
            size="small"
            sx={{
              mb: 3,
              px: 1,
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
              color: BRAND2,
              background: "rgba(106,227,255,0.1)",
              border: "1px solid rgba(106,227,255,0.3)",
              backdropFilter: "blur(8px)",
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.6rem", sm: "3.6rem", md: "4.2rem" },
              lineHeight: 1.08,
              letterSpacing: "-2px",
              mb: 2.5,
              background: "linear-gradient(135deg, #ffffff 25%, #6AE3FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Simulate Better.
            <Box component="span" sx={{ WebkitTextFillColor: BRAND, color: BRAND }}>
              Plan Smarter.
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.18rem" },
              opacity: 0.68,
              maxWidth: 580,
              mx: "auto",
              lineHeight: 1.75,
              mb: 5,
            }}
          >
            Intelliplan unifies Demand and Supply planning into a single intelligent
            workspace — powered by AI, built for Kimberly-Clark.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2.5,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => navigate("/demand-planning")}
              startIcon={<TrendingUpRoundedIcon />}
              sx={{
                px: 3.5,
                py: 1.35,
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "none",
                background: `linear-gradient(135deg, ${BRAND} 0%, #14756e 100%)`,
                color: "#fff",
                boxShadow: "0 8px 28px rgba(27,147,138,0.45)",
                "&:hover": { filter: "brightness(1.12)" },
              }}
            >
              Demand Planning
            </Button>
            <Button
              onClick={() => navigate("/supply-planning")}
              startIcon={<InventoryRoundedIcon />}
              sx={{
                px: 3.5,
                py: 1.35,
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "none",
                color: "#fff",
                border: "1px solid rgba(167,139,250,0.45)",
                background: "rgba(167,139,250,0.1)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: "rgba(167,139,250,0.18)",
                  borderColor: "rgba(167,139,250,0.7)",
                },
              }}
            >
              Supply Planning
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            opacity: 0.3,
          }}
        >
          <Box
            sx={{ width: 1.5, height: 36, borderRadius: 4, background: "#fff" }}
          />
          <Typography
            sx={{
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </Typography>
        </Box>
      </Box>

      {/* ── STATS ────────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(12px)",
          py: 3.5,
          px: { xs: 3, md: 8 },
          display: "flex",
          justifyContent: "center",
          gap: { xs: 4, md: 10 },
          flexWrap: "wrap",
        }}
      >
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.7rem", md: "2.1rem" },
                  color: BRAND2,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.73rem",
                  opacity: 0.5,
                  mt: 0.5,
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </Typography>
            </Box>
            {i < stats.length - 1 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: "rgba(255,255,255,0.08)",
                  display: { xs: "none", md: "block" },
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* ── DOMAIN CARDS ─────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 10 } }}>
        {/* LOGIN BANNER - uncomment when auth is re-enabled */}
        {/*
        <Box sx={{ mb: 8 }}>
          {showLoginBanner && (
            <Paper elevation={0} sx={{ mx: "auto", maxWidth: 560, px: 3, py: 2, borderRadius: 4, display: "flex", alignItems: "center", gap: 2, background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LoginIcon />
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize="0.9rem">You are not signed in</Typography>
                <Typography fontSize="0.7rem" sx={{ opacity: 0.85 }}>Login to access all features</Typography>
              </Box>
              <Button onClick={handleLogin} sx={{ ml: 2, px: 3, py: 0.8, borderRadius: 3, fontWeight: 700, fontSize: "0.75rem", textTransform: "none", color: "#0B0F1A", background: "linear-gradient(135deg, #FFFFFF 0%, #DADADA 100%)", "&:hover": { background: "linear-gradient(135deg, #F3F3F3 0%, #CFCFCF 100%)" } }}>Login with OKTA</Button>
            </Paper>
          )}
        </Box>
        */}

        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: BRAND,
              textTransform: "uppercase",
              mb: 1.5,
            }}
          >
            Planning Domains
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.9rem", md: "2.6rem" },
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
            }}
          >
            Choose your planning domain
          </Typography>
          <Typography sx={{ opacity: 0.5, mt: 1.5, fontSize: "0.95rem" }}>
            Two specialized workspaces. One unified platform.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, md: 5 },
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: 960,
            mx: "auto",
          }}
        >
          {domains.map((domain) => (
            <Box
              key={domain.title}
              onClick={() => navigate(domain.route)}
              sx={{
                flex: "1 1 400px",
                maxWidth: 460,
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 100%)",
                backdropFilter: "blur(24px)",
                p: { xs: 3.5, md: 5 },
                cursor: "pointer",
                transition: "all 0.32s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-8px)",
                  border: `1px solid ${domain.accent}50`,
                  boxShadow: `0 32px 80px ${domain.accent}18`,
                  "& .top-line": { opacity: 1 },
                  "& .cta-row": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Box
                className="top-line"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, transparent 0%, ${domain.accent} 50%, transparent 100%)`,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  borderRadius: "24px 24px 0 0",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 3.5,
                }}
              >
                <Box
                  component="img"
                  src={domain.imgIcon}
                  alt={domain.title}
                  sx={{
                    width: 64,
                    height: 64,
                    filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
                  }}
                />
                <Chip
                  label={domain.badge}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: domain.accent,
                    background: `${domain.accent}18`,
                    border: `1px solid ${domain.accent}40`,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  mb: 1.5,
                  letterSpacing: "-0.4px",
                  color: "#fff",
                }}
              >
                {domain.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.87rem",
                  opacity: 0.58,
                  lineHeight: 1.75,
                  mb: 3.5,
                }}
              >
                {domain.description}
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 0.9, mb: 4 }}
              >
                {domain.modules.map((mod) => (
                  <Box
                    key={mod}
                    sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: domain.accent,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: "0.8rem", opacity: 0.65 }}>
                      {mod}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                className="cta-row"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  color: domain.accent,
                  opacity: 0.75,
                  transform: "translateY(4px)",
                  transition: "all 0.28s ease",
                }}
              >
                Enter workspace
                <Box component="span" sx={{ fontSize: "1.1rem", lineHeight: 1 }}>
                  →
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          py: 4,
          px: { xs: 3, md: 8 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src={Logo}
            alt="Intelliplan"
            sx={{ height: 28, borderRadius: "6px" }}
          />
          <Typography
            sx={{ fontSize: "0.72rem", opacity: 0.3, letterSpacing: "0.04em" }}
          >
            {`\u00A9 ${new Date().getFullYear()} Intelliplan. All rights reserved.`}
          </Typography>
        </Box>
        <Box
          component="img"
          src={KCLogo}
          alt="Kimberly-Clark"
          sx={{ height: 20, opacity: 0.45 }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;
