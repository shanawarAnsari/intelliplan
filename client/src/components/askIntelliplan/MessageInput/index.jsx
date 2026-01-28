/**
 * Message Input Component - Refactored
 */
import React, { useState, useRef, useEffect } from "react"; // Add useEffect
import { TextField, Paper, Box, useTheme, Typography, Chip } from "@mui/material";
import { MAX_MESSAGE_CHARS, CHAR_COUNTER_THRESHOLD } from "../../../utils/constants";
import ActionButtons from "./ActionButtons";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textFieldRef = useRef(null);
  const theme = useTheme();

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled) {
      requestAnimationFrame(() => {
        textFieldRef.current?.focus();
      });
    }
  }, [disabled]);

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
      // Remove manual focus here, let useEffect handle it
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
        p: "12px",
        borderRadius: "12px",
        background: "rgba(31, 41, 55, 0.7)",
        backdropFilter: "blur(20px)",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Main Input Area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        {/* Input Field */}
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={5}
          minRows={3}
          placeholder="Type your message...(Tab to follow up, Shift+Enter for new line) "
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          // onFocus={() => setIsFocused(true)}
          // onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={true}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "0.8125rem",
              fontFamily: "inherit",
              lineHeight: 1.5,
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
              paddingTop: "2px",
              paddingBottom: "2px",
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
          mt: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "20px",
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {message.trim() && !disabled && (
            <Chip
              label="Press Enter to send"
              size="small"
              variant="outlined"
              sx={{
                height: "18px",
                fontSize: "0.625rem",
                color: theme.palette.text.secondary,
                borderColor: "rgba(96, 165, 250, 0.3)",
                backgroundColor: "rgba(96, 165, 250, 0.05)",
                fontWeight: 500,
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
              fontSize: "0.625rem",
              fontWeight: 600,
              px: 0.75,
              py: 0.25,
              borderRadius: "6px",
              backgroundColor:
                charCount > MAX_MESSAGE_CHARS * 0.95
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(96, 165, 250, 0.1)",
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