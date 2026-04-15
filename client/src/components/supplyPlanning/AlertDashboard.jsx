import React from "react";
import { Box, Typography } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const AlertDashboard = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: 2,
      color: "rgba(255,255,255,0.35)",
      userSelect: "none",
    }}
  >
    <NotificationsActiveIcon sx={{ fontSize: 56, opacity: 0.3 }} />
    <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.5 }}>
      Alert Dashboard
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.35 }}>
      Coming soon
    </Typography>
  </Box>
);

export default AlertDashboard;
