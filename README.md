# IntelliPlan - AI Chat Assistant

A modern React-based chat application that communicates with AI agents via REST API calls. The application provides a clean, user-friendly interface for interacting with large language models.

## Features

- ✨ **Clean REST API Integration**: Simple HTTP calls with standardized payload structure
- 🎨 **Modern UI Design**: Built with Material-UI (MUI) for a professional look and feel
- 💾 **Conversation History**: Automatic saving of conversations to localStorage
- 🌙 **Dark Theme**: Eye-friendly dark theme with custom design tokens
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Messaging**: Send messages and receive responses instantly
- 🎯 **User-friendly**: Intuitive interface with clear visual hierarchy

## Technology Stack

- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) v5
- **API Communication**: Fetch API
- **State Management**: React Context API
- **Storage**: localStorage for conversation history
- **Styling**: CSS-in-JS with MUI theme system

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- .env file with API configuration

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

   Update the variables with your API endpoint and user information.

3. **Start Development Server**

   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## API Integration

### REST API Endpoint

The application sends messages to your API at: `{REACT_APP_API_BASE_URL}/chat`

### Request Payload Structure

```json
{
  "model": "gpt-4.1-mini",
  "temperature": "0",
  "user": [
    {
      "sub": "user@example.com",
      "email": "user@example.com"
    }
  ],
  "requestTime": "1740488332202",
  "messages": [
    {
      "prompt": "user's message",
      "adGroupName": "KC_GENAI_OKTA_NONPROD_INTELLIPLAN"
    }
  ],
  "maxTokens": 2000,
  "chatHistory": "15"
}
```

### Expected Response

```json
{
  "answer": "response text from the AI model",
  "conversationId": "optional-conversation-id",
  "success": true
}
```

## Project Structure

```
src/
├── components/
│   ├── ChatBox.jsx                # Main chat interface
│   ├── ChatMessage.jsx            # Message display component
│   ├── MessageInput.jsx           # Input field component
│   └── ConversationHistory.jsx    # Sidebar conversation list
├── contexts/
│   ├── ConversationContext.jsx    # Global state management
│   └── ThemeContext.jsx           # Theme provider
├── services/
│   └── RestApiService.js          # API communication
├── styles/
│   ├── global.css                 # Global animations
│   └── theme.js                   # MUI theme config
├── App.jsx                        # Root component
└── index.jsx                      # Entry point
```

## Usage Guide

### Sending a Message

Messages are automatically sent when users click the send button or press Enter. The app handles:

- User message display
- Loading state while waiting for API response
- Error handling and display
- Conversation history updates

### Managing Conversations

- **Create new**: Click "New Conversation" or clear the chat
- **View history**: Select from conversation list in sidebar
- **Auto-save**: Conversations are saved to localStorage automatically

## Environment Variables

```env
# Required
REACT_APP_API_BASE_URL=http://your-api-endpoint/api

# User Configuration
REACT_APP_USER_EMAIL=your-email@example.com
REACT_APP_USER_SUB=your-email@example.com
REACT_APP_AD_GROUP=YOUR_AD_GROUP

# Model Configuration (optional)
REACT_APP_MODEL=gpt-4.1-mini
REACT_APP_TEMPERATURE=0
REACT_APP_MAX_TOKENS=2000
REACT_APP_CHAT_HISTORY=15
```

## Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Troubleshooting

### API Connection Issues

- Verify `REACT_APP_API_BASE_URL` is correct and accessible
- Check CORS is enabled on your API server
- Inspect browser Network tab for failed requests
- Check console for error messages

### Conversations Not Saving

- Ensure localStorage is enabled
- Check browser storage quota
- Clear browser cache if needed

### Build Issues

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Performance Notes

- Messages are rendered efficiently with React Context
- CSS animations are GPU-accelerated
- Conversations are persisted locally to reduce API calls
- API requests include only necessary data

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- User authentication integration
- File upload support
- Message search and filtering
- Export conversations
- Real-time typing indicators
- Voice input/output support
- Multi-language support

## Security Notes

- All API calls use standard HTTP (update to HTTPS in production)
- User email/ID stored in environment variables
- Conversations stored locally only
- No sensitive data in localStorage

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify environment variables in `.env`
3. Test API endpoint accessibility
4. Review the API payload structure

---

**Last Updated**: November 2024  
**Version**: 1.0.0
