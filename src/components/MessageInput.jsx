import React, { useState } from "react";
import { TextField, IconButton, Paper, Box, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={1}
      sx={{
        display: "flex",
        alignItems: "center",
        p: "10px 16px",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: "transparent",
        boxShadow: theme.shadows[2],
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
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        variant="outlined"
        disabled={disabled}
        InputProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            fontSize: theme.typography.chatMessage.fontSize,
          },
        }}
        sx={{
          mr: 1.5,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: theme.palette.divider,
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
      />
      <Box>
        <IconButton
          type="submit"
          color="primary"
          disabled={!message.trim() || disabled}
          sx={{
            width: "40px",
            height: "40px",
            padding: "8px",
          }}
          className={message.trim() && !disabled ? "button-pulse" : ""}
        >
          <SendIcon fontSize="medium" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
