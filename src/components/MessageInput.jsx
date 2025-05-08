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
      elevation={3} // Increased elevation
      sx={{
        display: "flex",
        alignItems: "center",
        p: "12px 16px", // Adjusted padding
        borderRadius: "12px", // Added border radius
        backgroundColor: "background.paper", // Ensure it uses theme background
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", // Softer shadow
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4} // Slightly increased maxRows
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        variant="outlined" // Changed to outlined
        disabled={disabled}
        InputProps={{
          sx: {
            borderRadius: "8px", // Rounded corners for the input field itself
            fontSize: "0.95rem",
          },
        }}
        sx={{
          mr: 1, // Margin to separate from the button
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.23)", // Default border color
            },
            "&:hover fieldset": {
              borderColor: "primary.main", // Border color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main", // Border color when focused
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "primary.dark", // Use primary.dark from theme
            },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
