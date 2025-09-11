import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

const HelpFAQ = ({ open, onClose }) => {
  const theme = useTheme();
  const faqItems = [
    {
      question: "What can this chatbot do?",
      answer:
        "This AI assistant can help with data analysis, generate insights from your sales data, create forecasts, and answer questions about market trends and performance metrics.",
    },
    {
      question: "How do I start a new conversation?",
      answer:
        "Click on the 'New Conversation' button in the sidebar or simply start typing your question in the message box below.",
    },
    {
      question: "Can I save my conversations?",
      answer:
        "Yes, all conversations are automatically saved in the sidebar. You can access them anytime by clicking on the conversation title.",
    },
    {
      question: "What type of data can I analyze?",
      answer:
        "You can analyze sales data, market trends, customer behavior patterns, product performance, and regional metrics. Simply ask a question about the data you're interested in.",
    },
    {
      question: "How accurate are the forecasts?",
      answer:
        "Forecasts are based on historical data patterns and use advanced predictive models. Accuracy depends on data quality and market stability, but predictions typically include confidence intervals.",
    },
    {
      question: "Can I export the analysis results?",
      answer:
        "Yes, you can ask the assistant to prepare data for export. You'll receive downloadable files with your analysis results when available.",
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="medium" className="text-reveal">
            Help & Information
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1} mb={1}>
          Frequently asked questions about this assistant
        </Typography>
      </Box>

      <Box sx={{ p: 1, overflowY: "auto" }}>
        {faqItems.map((item, index) => (
          <Fade
            key={index}
            in={true}
            timeout={300}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                bgcolor: "transparent",
                "&:before": { display: "none" },
                borderBottom:
                  index < faqItems.length - 1
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />
                }
                sx={{
                  px: 1.5,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                <Typography fontSize="0.9rem" fontWeight="medium">
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.5, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Fade>
        ))}
      </Box>

      <Box
        sx={{ p: 2, mt: "auto", borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="body2" color="text.secondary" mb={1}>
          Need more help?
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          className="hover-lift"
          sx={{
            display: "inline-block",
            cursor: "pointer",
            transition: "color 0.2s ease",
            "&:hover": {
              color: theme.palette.primary.light,
            },
          }}
        >
          Email support@intelliplan.kcc.com
        </Typography>
      </Box>
    </Drawer>
  );
};

export default HelpFAQ;
