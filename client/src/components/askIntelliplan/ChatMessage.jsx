import React, { useState, useEffect, useMemo } from "react";
import { Paper, Avatar, useTheme } from "@mui/material";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageActions from "./MessageActions";

/**
 * Decodes HTML entities (handles double-encoding like S&amp;amp;OP -> S&OP).
 * Safe because we still render via React text nodes (no innerHTML injection).
 */
function decodeEntities(input) {
  if (typeof input !== "string" || !input.includes("&")) return input;

  const decodeOnce = (str) => {
    const el = document.createElement("textarea");
    el.innerHTML = str;
    return el.value;
  };

  // Pass 1
  const once = decodeOnce(input);

  // Pass 2 (only if still looks entity-ish)
  // Handles: &amp;amp; -> &amp; -> &
  // Handles: &amp;#x27; -> &#x27; -> '
  const twice = once.includes("&") ? decodeOnce(once) : once;

  return twice;
}

/**
 * Decode any primitive value safely for display.
 * - strings decoded
 * - numbers/booleans left as-is
 * - null/undefined -> ""
 */
function decodeForDisplay(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return decodeEntities(value);
  return value;
}

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

  const formattedTime = `${new Date(timestamp).toDateString()} - ${new Date(timestamp).toLocaleTimeString()}`;

  // ✅ Decode message once (memoized)
  const displayMessage = useMemo(() => decodeForDisplay(message), [message]);

  // ✅ Decode table columns + values without changing structure
  const decodedTable = useMemo(() => {
    if (!dataTable || typeof dataTable !== "object") return null;

    const out = Object.create(null);

    for (const rawCol of Object.keys(dataTable)) {
      const decodedCol = decodeEntities(rawCol);

      // ✅ INLINE explicit prototype‑pollution guard (scanner‑visible)
      if (
        decodedCol === "__proto__" ||
        decodedCol === "prototype" ||
        decodedCol === "constructor"
      ) {
        continue;
      }

      const colData = dataTable[rawCol];
      const safeCol = Object.create(null);

      if (colData && typeof colData === "object") {
        for (const rawKey of Object.keys(colData)) {
          const cell = colData[rawKey];

          safeCol[rawKey] =
            typeof cell === "string" ? decodeEntities(cell) : cell;
        }
      }

      // ✅ SAFE assignment (CWE‑1321 compliant)
      Object.defineProperty(out, decodedCol, {
        value: safeCol,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    return out;
  }, [dataTable]);

  const renderTable = () => {
    if (!decodedTable) return null;

    const columns = Object.keys(decodedTable);
    if (!columns.length) return null;

    const firstCol = columns[0];
    const rowCount = decodedTable[firstCol] ? Object.keys(decodedTable[firstCol]).length : 0;
    if (!rowCount) return null;

    return (
      <Box
        sx={{
          overflowX: "auto",
          border: `1px solid ${theme.palette.divider} `,
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
                {columns.map((col) => {
                  const cell = decodedTable[col]?.[rowIndex];

                  // Preserve your existing formatting behavior
                  const display =
                    typeof cell === "number"
                      ? cell.toLocaleString()
                      : typeof cell === "string"
                        ? cell
                        : cell?.toLocaleString?.()
                          ? cell.toLocaleString()
                          : cell ?? "";

                  return (
                    <TableCell key={`${col} -${rowIndex} `} sx={{ textWrap: "noWrap" }}>
                      {display}
                    </TableCell>
                  );
                })}
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
              background: isBot ? "rgba(31, 41, 55, 0.8)" : "rgba(31, 71, 55, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: theme.palette.text.primary,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {displayMessage}
            </Typography>

            {decodedTable && renderTable()}

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

          <Box sx={{ mt: 0.5 }}>
            <MessageActions
              message={displayMessage}   // ✅ pass decoded message for copy/share
              dataTable={decodedTable}   // ✅ pass decoded table too
              isBot={isBot}
              feedback={feedback}
              onFeedbackChange={handleFeedbackChange}
              onFeedbackSubmit={handleFeedbackSubmit}
              sessionId={sessionId}
              messageId={messageId}
            />
          </Box>
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