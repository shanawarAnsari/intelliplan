/**
 * Message Input Component - Refactored
 */
import React, { useState, useRef } from "react";
import { TextField, Paper, Box, useTheme, Typography, Chip } from "@mui/material";
import { MAX_MESSAGE_CHARS, CHAR_COUNTER_THRESHOLD } from "../../utils/constants";
import ActionButtons from "./ActionButtons";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textFieldRef = useRef(null);
  const theme = useTheme();

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_MESSAGE_CHARS) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      setCharCount(0);
      textFieldRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const showCharCounter = charCount > MAX_MESSAGE_CHARS * CHAR_COUNTER_THRESHOLD;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: "16px",
        borderRadius: "16px",
        background: "rgba(31, 41, 55, 0.7)",
        backdropFilter: "blur(20px)",
        border: isFocused
          ? "2px solid rgba(96, 165, 250, 0.6)"
          : "2px solid rgba(255, 255, 255, 0.08)",
        boxShadow: isFocused
          ? "0 0 0 4px rgba(96, 165, 250, 0.15), 0 8px 24px rgba(0, 0, 0, 0.2)"
          : "0 4px 16px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": isFocused
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)",
              backgroundSize: "200% 100%",
              animation: "gradientSlide 3s linear infinite",
            }
          : {},
        "@keyframes gradientSlide": {
          "0%": {
            backgroundPosition: "0% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      }}
    >
      {/* Main Input Area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1.5,
        }}
      >
        {/* Input Field */}
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={6}
          minRows={3}
          placeholder="Type your message here... (Shift+Enter for new line)"
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "0.9375rem",
              fontFamily: "inherit",
              lineHeight: 1.7,
              color: theme.palette.text.primary,
            },
          }}
          inputProps={{
            maxLength: MAX_MESSAGE_CHARS,
            "aria-label": "Message input",
            "aria-describedby": "char-count",
          }}
          sx={{
            mr: 0,
            "& .MuiInput-root": {
              paddingTop: "4px",
              paddingBottom: "4px",
            },
            "& textarea": {
              "&::placeholder": {
                opacity: 0.6,
                color: theme.palette.text.hint,
              },
            },
          }}
        />

        <ActionButtons
          disabled={disabled}
          message={message}
          onSubmit={handleSubmit}
        />
      </Box>

      {/* Character Counter and Hints */}
      <Box
        sx={{
          mt: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "24px",
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {message.trim() && !disabled && (
            <Chip
              label="Press Enter to send"
              size="small"
              variant="outlined"
              sx={{
                height: "22px",
                fontSize: "0.7rem",
                color: theme.palette.text.secondary,
                borderColor: "rgba(96, 165, 250, 0.3)",
                backgroundColor: "rgba(96, 165, 250, 0.05)",
                fontWeight: 500,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "rgba(96, 165, 250, 0.5)",
                  backgroundColor: "rgba(96, 165, 250, 0.1)",
                },
              }}
            />
          )}
        </Box>

        {showCharCounter && (
          <Typography
            variant="caption"
            id="char-count"
            sx={{
              color:
                charCount > MAX_MESSAGE_CHARS * 0.95
                  ? theme.palette.error.main
                  : theme.palette.text.secondary,
              fontSize: "0.7rem",
              fontWeight: 600,
              px: 1,
              py: 0.5,
              borderRadius: "8px",
              backgroundColor:
                charCount > MAX_MESSAGE_CHARS * 0.95
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(96, 165, 250, 0.1)",
              transition: "all 0.3s ease",
            }}
          >
            {charCount} / {MAX_MESSAGE_CHARS}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MessageInput;
