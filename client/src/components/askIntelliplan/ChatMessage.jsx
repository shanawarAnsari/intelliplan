
import React, { useState, useEffect } from "react";
import { Paper, Avatar, useTheme } from "@mui/material";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageActions from "./MessageActions";

const ChatMessage = ({
  message,
  dataTable,
  isBot,
  timestamp,
  feedback: initialFeedback,
  messageId,
  sessionId,
  onUpdateFeedback,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState(initialFeedback);

  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const handleFeedbackChange = (newFeedback) => setFeedback(newFeedback);
  const handleFeedbackSubmit = (payload) => onUpdateFeedback(payload);

  const formattedTime = new Date(timestamp).toLocaleTimeString();
  const renderTable = () => {
    if (!dataTable) return null;

    const columns = Object.keys(dataTable);
    const rowCount = Object.keys(dataTable[columns[0]]).length;

    return (
      <Box
        sx={{
          overflowX: "auto",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          maxHeight: 480,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold", textWrap: "noWrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={`${col}-${rowIndex}`} sx={{ textWrap: "noWrap" }}>
                    {(dataTable[col][rowIndex])?.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: isBot ? "flex-start" : "flex-end",
          gap: 1,
        }}
      >
        {isBot && (
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
              flex: "0 0 auto",
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}

        {/* Column wrapper */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isBot ? "flex-start" : "flex-end",
            maxWidth: "70%",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "fit-content",
              maxWidth: "100%",
              p: 1.5,
              borderRadius: isBot ? "0px 12px 12px 12px" : "12px 0px 12px 12px",
              background: isBot
                ? "rgba(31, 41, 55, 0.8)"
                : "rgba(31, 71, 55, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: theme.palette.text.primary,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              {message}
            </Typography>

            {dataTable && renderTable()}


            {/* ✅ Timestamp inside bubble for BOTH bot and user */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                textAlign: "right",
                color: theme.palette.text.secondary,
              }}
            >
              {formattedTime}
            </Typography>
          </Paper>

          {/* ✅ Bot actions under bubble */}
          {isBot && (
            <Box sx={{ mt: 0.5 }}>
              <MessageActions
                message={message}
                isBot={isBot}
                feedback={feedback}
                onFeedbackChange={handleFeedbackChange}
                onFeedbackSubmit={handleFeedbackSubmit}
                sessionId={sessionId}
                messageId={messageId}
              />
            </Box>
          )}
        </Box>

        {!isBot && (
          <Avatar
            sx={{
              bgcolor: theme.palette.secondary.main,
              width: 32,
              height: 32,
              flex: "0 0 auto",
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;
