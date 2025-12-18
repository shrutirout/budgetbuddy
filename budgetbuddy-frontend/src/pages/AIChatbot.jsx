import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../api/axios';

// AI financial advisor chat interface with message history and quick actions.

const AIChatbot = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChatbot = async () => {
      await fetchChatHistory();
      await fetchQuickActions();
    };

    initializeChatbot();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chatbot/history?limit=50');
      const history = response.data.messages || [];

      if (history.length > 0) {
        setMessages(history.reverse());
      } else {
        setMessages([{
          role: 'assistant',
          content: '👋 Hi! I\'m your AI financial advisor. I can help you understand your spending patterns, track budgets, and make better financial decisions. Ask me anything about your finances!',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m your AI financial advisor. I can help you understand your spending patterns, track budgets, and make better financial decisions. Ask me anything about your finances!',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const fetchQuickActions = async () => {
    try {
      const response = await api.get('/chatbot/quick-actions');
      setQuickActions(response.data.quickActions || []);
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      setQuickActions([
        'How much am I spending on food?',
        'Am I on track with my budget?',
        'Where should I cut costs?',
        'When will I run out of money?',
        'Analyze my spending patterns',
        'Give me savings tips'
      ]);
    }
  };

  const handleSendMessage = async (messageText = userInput) => {
    console.log('🚀 handleSendMessage called with:', messageText);
    if (!messageText.trim()) {
      console.log('❌ Empty message, returning');
      return;
    }

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      console.log('📤 Sending POST to /chatbot with:', { message: messageText });
      const response = await api.post('/chatbot', {
        message: messageText
      });
      console.log('📥 Received response:', response.data);

      const aiMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: response.data.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ Chat error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again or check if the AI service is properly configured.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete('/chatbot/history');

      setMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m your AI financial advisor. I can help you understand your spending patterns, track budgets, and make better financial decisions. Ask me anything about your finances!',
        timestamp: new Date().toISOString()
      }]);

      console.log('✅ Chat history cleared successfully');
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format timestamp for display
   *
   * Example: "10:30 AM"
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  AI Financial Advisor
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Get personalized financial insights and advice
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Clear History Button */}
                <button
                  onClick={clearChatHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center text-sm"
                  title="Clear all chat history"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear History
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                {/* Back to Dashboard */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium text-sm"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-8 py-6">
          {/* Quick Actions - Show only if no messages (except welcome) */}
          {messages.length <= 1 && quickActions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Try asking:
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your finances..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !userInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
