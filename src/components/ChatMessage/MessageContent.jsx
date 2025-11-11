/**
 * Message Content Component - Renders formatted text and code blocks
 */
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const MessageContent = ({ text }) => {
  const theme = useTheme();

  // Parse and render formatted text (basic markdown support)
  const renderFormattedText = (text) => {
    if (!text) return "";

    // Split by code blocks first
    const parts = text.split(/```[\s\S]*?```/g);
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];

    const rendered = [];
    let codeIndex = 0;

    parts.forEach((part, idx) => {
      if (part.trim()) {
        rendered.push(
          <Typography
            key={`text-${idx}`}
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              mb: idx < parts.length - 1 ? 1 : 0,
            }}
          >
            {part}
          </Typography>
        );
      }

      if (idx < codeBlocks.length) {
        rendered.push(
          <Box
            key={`code-${idx}`}
            component="pre"
            sx={{
              bgcolor: theme.palette.background.secondary,
              p: 1.5,
              borderRadius: 1,
              overflow: "auto",
              mb: 1,
              fontSize: "0.85rem",
              fontFamily: '"Courier New", monospace',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <code>{codeBlocks[codeIndex++]}</code>
          </Box>
        );
      }
    });

    return rendered.length > 0 ? rendered : text;
  };

  return (
    <Typography
      sx={{
        fontSize: "0.8125rem",
        lineHeight: 1.5,
        letterSpacing: "0.2px",
      }}
    >
      {typeof text === "string" ? renderFormattedText(text) : text}
    </Typography>
  );
};

export default MessageContent;
