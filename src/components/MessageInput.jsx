import React, { useState } from "react";
import { TextField, IconButton, Paper, Box, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import StopCircleIcon from "@mui/icons-material/StopCircle";

const MessageInput = ({ onSendMessage, disabled, onStopGenerating }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleStopGenerating = () => {
    if (onStopGenerating) {
      onStopGenerating();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        p: "8px 12px",
        borderRadius: "10px",
        backgroundColor: "background.paper",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
      }}
      className="slide-up"
    >
      <TextField
        fullWidth
        multiline
        maxRows={3}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          // Only submit if not disabled and Enter is pressed without Shift
          if (e.key === "Enter" && !e.shiftKey && !disabled) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        variant="outlined"
        // Always allow typing - never disable the input field
        disabled={false}
        InputProps={{
          sx: {
            borderRadius: "6px",
            fontSize: "0.9rem",
          },
        }}
        sx={{
          mr: 0.75,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.23)",
            },
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
            },
            padding: "4px 8px",
          },
        }}
      />
      <Box>
        {disabled ? (
          <Tooltip title="Stop generating">
            <IconButton
              onClick={handleStopGenerating}
              sx={{
                bgcolor: "rgba(211, 47, 47, 0.1)",
                color: "#d32f2f",
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.2)",
                },
                width: "32px",
                height: "32px",
                padding: "6px",
              }}
            >
              <StopCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton
            type="submit"
            color="primary"
            disabled={!message.trim()}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
              },
              width: "32px",
              height: "32px",
              padding: "6px",
            }}
            className={message.trim() ? "button-pulse" : ""}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default MessageInput;
