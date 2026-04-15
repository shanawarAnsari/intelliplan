import React from "react";
import { Box, Typography } from "@mui/material";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

const PlaceholderPage = ({ title, icon: Icon }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "60vh",
      gap: 2,
      color: "rgba(255,255,255,0.3)",
      userSelect: "none",
    }}
  >
    {Icon && <Icon sx={{ fontSize: 52, opacity: 0.25 }} />}
    <Typography
      sx={{
        fontFamily: NAV_FONT,
        fontWeight: 700,
        fontSize: "1rem",
        opacity: 0.45,
      }}
    >
      {title}
    </Typography>
    <Typography sx={{ fontFamily: NAV_FONT, fontSize: "0.78rem", opacity: 0.28 }}>
      Coming soon
    </Typography>
  </Box>
);

export default PlaceholderPage;
