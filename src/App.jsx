import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import ChatBox from "./components/ChatBox";
import ConversationHistory from "./components/ConversationHistory";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    // Initialize with dummy conversations about supply, demand and sales
    const dummyConversations = [
      {
        id: uuidv4(),
        title: "Q3 Sales Analysis",
        messages: [
          {
            role: "user",
            content: "Can you analyze our Q3 sales performance?",
          },
          {
            role: "assistant",
            content:
              "Based on the data, Q3 sales increased by 12% compared to Q2, with the strongest growth in the electronics category.",
          },
        ],
      },
      {
        id: uuidv4(),
        title: "Product Demand Forecast 2023",
        messages: [
          {
            role: "user",
            content: "What is the demand forecast for our product line in 2023?",
          },
          {
            role: "assistant",
            content:
              "The forecast indicates a 15% growth in demand for premium products, while mid-range products may see steady demand with only 3% growth.",
          },
        ],
      },
      {
        id: uuidv4(),
        title: "Regional Sales Performance",
        messages: [
          {
            role: "user",
            content: "How are sales performing across different regions?",
          },
          {
            role: "assistant",
            content:
              "The Western region leads with 32% of total sales, followed by the Eastern region at 28%, Southern at 22%, and Northern at 18%.",
          },
        ],
      },
      {
        id: uuidv4(),
        title: "Supply Chain Optimization",
        messages: [
          {
            role: "user",
            content: "How can we optimize our supply chain?",
          },
          {
            role: "assistant",
            content:
              "Implementing just-in-time inventory management could reduce holding costs by 18%, while improving supplier relationships could decrease lead times by 25%.",
          },
        ],
      },
      {
        id: uuidv4(),
        title: "Market Demand Trends",
        messages: [
          {
            role: "user",
            content: "What are the current market demand trends for our industry?",
          },
          {
            role: "assistant",
            content:
              "There's a significant shift toward sustainable products, with eco-friendly options seeing 28% higher demand growth compared to traditional alternatives.",
          },
        ],
      },
    ];

    setConversations(dummyConversations);
    setActiveConversation(dummyConversations[0]);
  }, []);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSelectConversation = (conversationId) => {
    const selected = conversations.find((conv) => conv.id === conversationId);
    if (selected) {
      setActiveConversation(selected);
    }
  };

  const handleNewConversation = (title) => {
    const newConversation = {
      id: uuidv4(),
      title: title,
      messages: [],
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);
  };

  const handleSetActiveConversation = (conversation) => {
    setActiveConversation(conversation);
    setConversations((prevConversations) => {
      const index = prevConversations.findIndex(
        (conv) => conv.id === conversation.id
      );
      if (index !== -1) {
        const newConversations = [...prevConversations];
        newConversations[index] = conversation;
        return newConversations;
      }
      return prevConversations;
    });
  };

  return (
    <ThemeProviderWrapper>
      <Box sx={{ display: "flex" }}>
        <ConversationHistory
          history={conversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          open={drawerOpen}
          onToggleDrawer={handleToggleDrawer}
        />
        <ChatBox
          drawerOpen={drawerOpen}
          onToggleDrawer={handleToggleDrawer}
          activeConversation={activeConversation}
          setActiveConversation={handleSetActiveConversation}
        />
      </Box>
    </ThemeProviderWrapper>
  );
}

export default App;
