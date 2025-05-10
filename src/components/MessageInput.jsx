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
      elevation={2} // Reduced elevation from 3
      sx={{
        display: "flex",
        alignItems: "center",
        p: "8px 12px", // Reduced padding from 12px 16px
        borderRadius: "10px", // Reduced border radius from 12px
        backgroundColor: "background.paper",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)", // Lighter shadow
      }}
      className="slide-up"
    >
      <TextField
        fullWidth
        multiline
        maxRows={3} // Reduced from 4 to 3
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
            borderRadius: "6px", // Reduced from 8px
            fontSize: "0.9rem", // Smaller font size
          },
        }}
        sx={{
          mr: 0.75, // Reduced margin from 1
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
            padding: "4px 8px", // Added padding reduction for the input itself
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
            width: "32px", // Reduced size from default
            height: "32px", // Reduced size from default
            padding: "6px", // Reduced padding
          }}
          className={message.trim() && !disabled ? "button-pulse" : ""}
        >
          <SendIcon fontSize="small" /> {/* Changed to small icon */}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
