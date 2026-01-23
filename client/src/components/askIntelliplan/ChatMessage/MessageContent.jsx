
/**
 * Message Content Component - Renders formatted text, HTML, code blocks, and structured table data
 */
import React, { useMemo } from "react";
import { Box, Typography, useTheme, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const MessageContent = ({ text, dataTable }) => {
  const theme = useTheme();
  // Decode HTML entities if backend sends escaped tags
  const decodeEntities = (encoded) => {
    if (typeof encoded !== "string") return encoded;
    const el = document.createElement("textarea");
    el.innerHTML = encoded;
    return el.value;
  };

  const looksLikeHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str);

  // Split input by code blocks ```...```
  const segments = useMemo(() => {
    if (typeof text !== "string") return [{ type: "node", value: text }];

    const codeRegex = /```([\s\S]*?)```/g;
    const result = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const [full, codeInner] = match;
      const start = match.index;

      if (start > lastIndex) {
        result.push({ type: "textOrHtml", value: text.slice(lastIndex, start) });
      }

      result.push({ type: "code", value: codeInner.trim() });
      lastIndex = start + full.length;
    }

    if (lastIndex < text.length) {
      result.push({ type: "textOrHtml", value: text.slice(lastIndex) });
    }

    if (result.length === 0) {
      return [{ type: "textOrHtml", value: text }];
    }

    return result;
  }, [text]);

  // Render table from structuredResponse.dataTable
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
    <Box sx={{ fontSize: "0.8125rem", lineHeight: 1.5, letterSpacing: "0.2px" }}>
      {/* Render text and code segments */}
      {segments.map((seg, idx) => {
        if (seg.type === "code") {
          return (
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
              <code>{seg.value}</code>
            </Box>
          );
        }

        const raw = seg.value;
        const decoded = decodeEntities(raw);
        const isHtml = looksLikeHtml(decoded);

        if (isHtml) {
          return (
            <Box
              key={`html-${idx}`}
              sx={{
                overflowX: "auto",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                maxHeight: 480,
              }}
              dangerouslySetInnerHTML={{ __html: decoded }}
            />
          );
        }

        const trimmed = decoded.trim();
        if (!trimmed) return <React.Fragment key={`empty-${idx}`} />;

        return (
          <Typography
            key={`text-${idx}`}
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 1 }}
          >
            {decoded}
          </Typography>
        );
      })}
      {/* Render structured table first if available */}
      {renderTable()}
    </Box>
  );
};

export default MessageContent;
