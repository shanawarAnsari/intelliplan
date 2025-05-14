// filepath: d:\Dev\intelliplan\src\components\Logger.jsx
import React, { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";

const Logger = ({ logs, isLoading }) => {
  const theme = useTheme();
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <Box
      ref={logContainerRef}
      sx={{
        maxHeight: "8rem",
        overflowY: "auto",
        backgroundColor: "#171b25",
        p: 1.5,
        fontSize: "0.75rem",
        fontFamily: "monospace",
        lineHeight: "1.4",
        color: theme.palette.text.secondary,
      }}
    >
      {logs.map((log, index) => (
        <Typography
          key={index}
          component="div"
          variant="caption"
          sx={{ whiteSpace: "pre-wrap", display: "block", mb: 0.5 }}
        >
          {log}
        </Typography>
      ))}
    </Box>
  );
};

export default Logger;
