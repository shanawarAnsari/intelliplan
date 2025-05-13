import React, { useState } from "react";
import { TextField, IconButton, Paper, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

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
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        variant="outlined"
        disabled={disabled}
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
        <IconButton
          type="submit"
          color="primary"
          disabled={!message.trim() || disabled}
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
          className={message.trim() && !disabled ? "button-pulse" : ""}
        >
          {" "}
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
