// In App.jsx or the parent component that uses ConversationHistory
import React, { useState } from "react";
import ConversationHistory from "./ConversationHistory";
import ChatBox from "./ChatBox";

function App() {
  const [isChatBoxLoading, setIsChatBoxLoading] = useState(false);

  return (
    <div className="app">
      <ConversationHistory isChatBoxLoading={isChatBoxLoading} />
      <ChatBox onIsLoadingChange={setIsChatBoxLoading} />
    </div>
  );
}

export default App;
