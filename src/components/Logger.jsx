// filepath: d:\Dev\intelliplan\src\components\Logger.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, useTheme, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const Logger = ({ logs, isLoading }) => {
  const theme = useTheme();
  const logContainerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const prevLogsLengthRef = useRef(0);

  // Auto-collapse when logs start appearing
  useEffect(() => {
    // If this is the first log entry, ensure Logger is collapsed
    if (logs.length === 1 && prevLogsLengthRef.current === 0) {
      setExpanded(false);
    }
    prevLogsLengthRef.current = logs.length;
  }, [logs]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!logs || logs.length === 0) {
    return null;
  }

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#171b25",
        borderRadius: "4px",
        mb: 1,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0.5,
          borderBottom: expanded ? `1px solid ${theme.palette.divider}` : "none",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: theme.palette.text.secondary,
            fontWeight: "bold",
            ml: 1,
          }}
        >
          {expanded ? "Debug Logs" : `${logs.length} debug logs`}
        </Typography>
        <IconButton
          size="small"
          onClick={toggleExpand}
          sx={{ color: theme.palette.text.secondary }}
        >
          {expanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          ref={logContainerRef}
          sx={{
            maxHeight: "20rem",
            overflowY: "auto",
            p: 1,
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
      </Collapse>

      {!expanded && logs.length > 0 && (
        <Box
          sx={{
            p: 0.5,
            fontSize: "0.75rem",
            fontFamily: "monospace",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ml: 1,
          }}
        >
          {logs[logs.length - 1]}
        </Box>
      )}
    </Box>
  );
};

export default Logger;
