import React from "react";
import { Box, Typography } from "@mui/material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

const ExecutiveSummary = () => (
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
    <AssessmentOutlinedIcon sx={{ fontSize: 56, opacity: 0.3 }} />
    <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.5 }}>
      Executive Summary
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.35 }}>
      Coming soon
    </Typography>
  </Box>
);

export default ExecutiveSummary;
