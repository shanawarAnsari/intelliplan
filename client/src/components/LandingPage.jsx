import React from "react";
import { Box, Typography, Button, Chip, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import landingBg from "../assets/landing.png";
import Logo from "../assets/Intelliplan-logo.png";
import KCLogo from "../assets/KC_logo_for_dark.png";
import DemandIcon from "../assets/demand.png";
import SupplyIcon from "../assets/supply.png";

import { useUserStore } from "../store/userStore";
import LoginIcon from "@mui/icons-material/Login";
import Paper from "@mui/material/Paper";

const BRAND = "#1B938A";
const BRAND2 = "#6AE3FF";

const FONT =
  "'Inter', 'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

const stats = [
  { value: "Ultra Fast", label: "Simulations" },
  { value: "Real-time", label: "AI Insights" },
  { value: "Alert", label: "Optimization" },
  { value: "Intelligent", label: "Planning" },
  { value: "Faster", label: " STO Decisions" },
];

const domains = [
  {
    title: "Demand Planning",
    description:
      "Forecast demand with AI-powered run-rate simulations. Access the Run Rate Simulator and Ask Intelliplan AI to drive confident, data-backed decisions.",
    imgIcon: DemandIcon,
    accent: BRAND2,
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

  const { isLoggedIn, isUserLoading } = useUserStore();

  const showLoginBanner = !isLoggedIn && !isUserLoading;

  const handleLogin = () => {
    navigate("/demand-planning");
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 56px)",
        bgcolor: "#04111e",
        color: "#fff",
        fontFamily: FONT,
        overflowX: "hidden",
      }}
    >
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          minHeight: "78vh",
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
            opacity: 0.5,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(27,147,138,0.24) 0%, transparent 70%), radial-gradient(ellipse 55% 35% at 80% 100%, rgba(106,227,255,0.1) 0%, transparent 60%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "8%",
            left: "5%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(27,147,138,0.13) 0%, transparent 70%)",
            filter: "blur(45px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "6%",
            right: "4%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
            filter: "blur(45px)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 740 }}>
          <Chip
            icon={
              <AutoAwesomeRoundedIcon
                sx={{ fontSize: "0.78rem !important", color: BRAND2 }}
              />
            }
            label="Demand & Supply Intelligence · Powered by AI"
            size="small"
            sx={{
              mb: 2.5,
              px: 0.8,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "0.68rem",
              letterSpacing: "0.05em",
              color: BRAND2,
              background: "rgba(106,227,255,0.08)",
              border: "1px solid rgba(106,227,255,0.25)",
              backdropFilter: "blur(8px)",
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: { xs: "2.3rem", sm: "3.1rem", md: "3.7rem" },
              lineHeight: 1.08,
              letterSpacing: "-1.8px",
              mb: 2,
              background: "linear-gradient(135deg, #ffffff 30%, #6AE3FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Simulate Better.{" "}
            <Box component="span" sx={{ color: BRAND, WebkitTextFillColor: BRAND }}>
              Plan Smarter.
            </Box>
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: { xs: "0.92rem", md: "1.05rem" },
              opacity: 0.6,
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.75,
              mb: 4,
            }}
          >
            Intelliplan unifies Demand and Supply planning into a single intelligent
            workspace — powered by AI, built for Kimberly-Clark.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => navigate("/demand-planning")}
              disabled={showLoginBanner}
              startIcon={
                <TrendingUpRoundedIcon sx={{ fontSize: "1rem !important" }} />
              }
              sx={{
                px: 3,
                py: 1.1,
                borderRadius: "10px",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "0.84rem",
                textTransform: "none",
                background: `linear-gradient(135deg, ${BRAND} 0%, #14756e 100%)`,
                color: "#fff",
                "&:hover": { filter: "brightness(1.1)" },
              }}
            >
              Demand Planning
            </Button>
            <Button
              variant="contained"
              disabled={showLoginBanner}
              onClick={() => navigate("/supply-planning")}
              startIcon={
                <InventoryRoundedIcon sx={{ fontSize: "1rem !important" }} />
              }
              sx={{
                px: 3,
                py: 1.1,
                borderRadius: "10px",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "0.84rem",
                textTransform: "none",
                color: "#fff",
                border: "1px solid rgba(167,139,250,0.4)",
                background: "rgba(167,139,250,0.7)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: "rgba(167,139,250,0.8)",
                  borderColor: "rgba(167,139,250,0.3)",
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
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            opacity: 0.25,
          }}
        >
          <Box
            sx={{ width: 1.5, height: 30, borderRadius: 4, background: "#fff" }}
          />
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: "0.56rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </Typography>
        </Box>
      </Box>
      {showLoginBanner && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            bottom: 190,
            left: "50%",
            transform: "translateX(-50%)",
            px: 3.5,
            py: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(14px)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            zIndex: 5,
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.45), inset 0 0 22px rgba(255,255,255,0.16)",
          }}
        >
          {/* Icon */}
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
            <LoginIcon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
              You’re not signed in
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", opacity: 0.75 }}>
              Login to access Demand & Supply workspaces
            </Typography>
          </Box>

          <Button
            onClick={handleLogin}
            sx={{
              ml: 2,
              px: 2.4,
              py: 0.6,
              borderRadius: 3,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: "0.72rem",
              textTransform: "none",
              color: "#000",
              background: "linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)",
              boxShadow: "0 6px 20px rgba(255,255,255,0.45)",
              "&:hover": {
                background: "linear-gradient(135deg, #f1f1f1 0%, #dcdcdc 100%)",
              },
            }}
          >
            Login using OKTA SSO
          </Button>
        </Paper>
      )}
      {/* STATS BAR */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)",
          py: 2.8,
          px: { xs: 3, md: 8 },
          display: "flex",
          justifyContent: "center",
          gap: { xs: 3.5, md: 8 },
          flexWrap: "wrap",
        }}
      >
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  color: BRAND2,
                  lineHeight: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: "0.87rem",
                  opacity: 0.65,
                  mt: 0.4,
                  letterSpacing: "0.06em",
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
                  borderColor: "rgba(255,255,255,0.07)",
                  display: { xs: "none", md: "block" },
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* DOMAIN CARDS */}
      <Box sx={{ py: { xs: 7, md: 10 }, px: { xs: 3, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: BRAND,
              textTransform: "uppercase",
              mb: 1.2,
            }}
          >
            Planning Domains
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: { xs: "1.7rem", md: "2.3rem" },
              letterSpacing: "-0.7px",
              lineHeight: 1.15,
            }}
          >
            Choose your planning domain
          </Typography>
          <Typography
            sx={{ fontFamily: FONT, opacity: 0.45, mt: 1.2, fontSize: "0.88rem" }}
          >
            Two specialized workspaces. One unified platform.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 2.5, md: 4 },
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: 920,
            mx: "auto",
            transition: "filter 0.25s ease, opacity 0.25s ease",
            filter: showLoginBanner ? "blur(2px)" : "none",
            opacity: showLoginBanner ? 0.8 : 1,
            pointerEvents: showLoginBanner ? "none" : "auto",
          }}
        >
          {domains.map((domain) => (
            <Box
              key={domain.title}
              onClick={() => navigate(domain.route)}
              sx={{
                flex: "1 1 380px",
                maxWidth: 440,
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.07)",
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 100%)",
                backdropFilter: "blur(20px)",
                p: { xs: 3, md: 4 },
                cursor: "pointer",
                transition: "all 0.28s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-7px)",
                  border: `1px solid ${domain.accent}45`,
                  boxShadow: `0 28px 70px ${domain.accent}15`,
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
                  height: 2.5,
                  background: `linear-gradient(90deg, transparent 0%, ${domain.accent} 50%, transparent 100%)`,
                  opacity: 0,
                  transition: "opacity 0.28s ease",
                  borderRadius: "20px 20px 0 0",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box
                  component="img"
                  src={domain.imgIcon}
                  alt={domain.title}
                  sx={{
                    width: 52,
                    height: 52,
                    filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.45))",
                  }}
                />
                <Chip
                  label={domain.badge}
                  size="small"
                  sx={{
                    height: 20,
                    fontFamily: FONT,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: domain.accent,
                    background: `${domain.accent}15`,
                    border: `1px solid ${domain.accent}38`,
                    letterSpacing: "0.02em",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: "1.32rem",
                  mb: 1.2,
                  letterSpacing: "-0.35px",
                  color: "#fff",
                }}
              >
                {domain.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: "0.89rem",
                  opacity: 0.52,
                  lineHeight: 1.5,
                  mb: 3,
                }}
              >
                {domain.description}
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 0.8, mb: 3.5 }}
              >
                {domain.modules.map((mod) => (
                  <Box
                    key={mod}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        bgcolor: domain.accent,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{ fontFamily: FONT, fontSize: "0.76rem", opacity: 0.6 }}
                    >
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
                  gap: 0.8,
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: domain.accent,
                  opacity: 0.7,
                  transform: "translateY(4px)",
                  transition: "all 0.24s ease",
                }}
              >
                Enter workspace
                <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
                  {String.fromCharCode(8594)}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          py: 3,
          px: { xs: 3, md: 8 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
          <Box
            component="img"
            src={Logo}
            alt="Intelliplan"
            sx={{ height: 24, borderRadius: "5px" }}
          />
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: "0.68rem",
              opacity: 0.28,
              letterSpacing: "0.04em",
            }}
          >
            {`\u00A9 ${new Date().getFullYear()} Intelliplan. All rights reserved.`}
          </Typography>
        </Box>
        <Box
          component="img"
          src={KCLogo}
          alt="Kimberly-Clark"
          sx={{ height: 18, opacity: 0.4 }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;
