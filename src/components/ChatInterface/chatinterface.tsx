import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import { FiSun, FiMoon, FiGlobe, FiUser, FiEdit } from 'react-icons/fi';
import { Message } from '../types';

interface ChatInterfaceProps {
  key: string;
  chatId: string;
  messages: Message[];
  onMessageSent: (chatId: string, message: Message) => void;
  onTranslate: () => void;
  onToggleTheme: () => void;
  onProfileClick: () => void;
  currentTheme: 'light' | 'dark';
  onUpdateChatTitle: (chatId: string, title: string) => void;
  currentChatTitle: string;
  onToggleVisualization?: (messageId: string, e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chatId, 
  messages,
  onMessageSent,
  onTranslate,
  onToggleTheme,
  onProfileClick,
  currentTheme,
  onUpdateChatTitle,
  currentChatTitle,
  onToggleVisualization
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentChatTitle);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  useEffect(() => {
    setEditedTitle(currentChatTitle);
  }, [currentChatTitle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFeedback = (messageId: string, reaction: 'up' | 'down') => {
    console.log(`Feedback ${reaction} for message ${messageId}`);
  };

  const copySqlToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateChatTitle(chatId, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleToggleVisualization = (messageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleVisualization) {
      onToggleVisualization(messageId, e);
    } else {
      setLocalMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, showVisualization: !msg.showVisualization } 
          : msg
      ));
    }
  };

  const renderBotMessageContent = (message: Message) => {
    if (message.sender === 'bot' && message.sqlQuery) {
      return (
        <>
          <p className="text-base md:text-lg">{message.text}</p>
          <div className="response-toggle-container mt-2 md:mt-4">
            <div className="response-toggle-buttons flex space-x-2">
              <button 
                onClick={(e) => handleToggleVisualization(message.id, e)}
                className={`toggle-btn px-3 py-1 text-sm md:px-4 md:py-2 md:text-base ${
                  !message.showVisualization ? 'active' : ''
                }`}
              >
                Show Query
              </button>
              <button 
                onClick={(e) => handleToggleVisualization(message.id, e)}
                className={`toggle-btn px-3 py-1 text-sm md:px-4 md:py-2 md:text-base ${
                  message.showVisualization ? 'active' : ''
                }`}
              >
                Show Visualization
              </button>
            </div>

            {message.showVisualization ? (
              <div className="visualization-container mt-3 md:mt-4">
                {message.visualization ? (
                  <img 
                    src={message.visualization} 
                    alt="Data visualization" 
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="visualization-placeholder p-4 text-center">
                    Visualization would appear here
                  </div>
                )}
              </div>
            ) : (
              <div className="sql-query mt-3 md:mt-4 relative">
                <pre className="p-3 text-sm md:text-base overflow-x-auto">{message.sqlQuery}</pre>
                <button 
                  className="copy-sql-btn absolute top-2 right-2 px-2 py-1 text-xs md:text-sm" 
                  onClick={() => copySqlToClipboard(message.sqlQuery || '')}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        </>
      );
    }
    return <p className="text-base md:text-lg">{message.text}</p>;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || isBotThinking) return;

    const messageTimestamp = Date.now();

    const userMessage: Message = {
      id: `msg-${messageTimestamp}-user`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(messageTimestamp),
    };
    onMessageSent(chatId, userMessage);
    setLocalMessages(prev => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: `msg-${messageTimestamp}-loading`,
      text: 'Generating SQL response...',
      sender: 'loading',
      timestamp: new Date(messageTimestamp + 1),
    };
    onMessageSent(chatId, loadingMessage);
    setLocalMessages(prev => [...prev, loadingMessage]);

    setInputValue('');
    setIsBotThinking(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${messageTimestamp}-bot`,
        text: `Here's the result for your query:`,
        sender: 'bot',
        timestamp: new Date(),
        showFeedback: true,
        sqlQuery: `SELECT * FROM ${inputValue.toLowerCase().split(' ')[0] || 'users'} LIMIT 10;`,
        visualization: 'https://via.placeholder.com/400x200?text=Sample+Visualization',
        showVisualization: true
      };

      onMessageSent(chatId, botMessage);
      setLocalMessages(prev => [...prev.filter(m => m.id !== loadingMessage.id), botMessage]);
      setIsBotThinking(false);
    }, 1000);
  };

  return (
    <div className={`chat-interface ${currentTheme} flex flex-col h-full`}>
      {/* Fixed App Header */}
      <div className="app-header p-4">
        <h1 className="app-title text-xl md:text-2xl font-bold">Text to SQL</h1>
      </div>

      {/* Chat Header with Action Buttons */}
      <div className="chat-header p-4 flex items-center justify-between">
        <div className="chat-title-container flex-1 mr-4">
          {isEditingTitle ? (
            <div className="title-edit-container">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                onBlur={handleSaveTitle}
                autoFocus
                className="title-edit-input w-full p-2 rounded border"
                aria-label="Edit chat title"
                placeholder="Enter chat title"
                title="Edit chat title"
              />
            </div>
          ) : (
            <h3 
              className="chat-title text-lg md:text-xl font-medium truncate cursor-pointer" 
              onClick={() => setIsEditingTitle(true)}
            >
              {currentChatTitle.length > 30 
                ? `${currentChatTitle.substring(0, 30)}...` 
                : currentChatTitle}
            </h3>
          )}
        </div>
        <div className="action-buttons flex space-x-2">
          <button 
            onClick={() => setIsEditingTitle(true)} 
            className="action-btn p-2 rounded-full hover:bg-opacity-20" 
            title="Edit Chat Title"
          >
            <FiEdit className="text-lg" />
          </button>
          <button onClick={onTranslate} className="action-btn p-2 rounded-full hover:bg-opacity-20" title="Translate">
            <FiGlobe className="text-lg" />
          </button>
          <button onClick={onToggleTheme} className="action-btn p-2 rounded-full hover:bg-opacity-20" title="Toggle Theme">
            {currentTheme === 'light' ? <FiMoon className="text-lg" /> : <FiSun className="text-lg" />}
          </button>
          <button onClick={onProfileClick} className="action-btn p-2 rounded-full hover:bg-opacity-20" title="Profile">
            <FiUser className="text-lg" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
<div className="chat-messages flex-1 overflow-y-auto p-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto">
  {localMessages.length === 0 ? (
    <div className="welcome-message text-center p-8">
      <p className="text-lg md:text-xl mb-2">Welcome to your new chat!</p>
      <p className="text-gray-600 dark:text-gray-400">
        Start typing to begin the conversation. You can ask questions about your database schema or request SQL queries.
      </p>
    </div>
  ) : (
    localMessages.map((message) => (
      <div key={message.id} className={`message-wrapper ${message.sender} mb-4`}>
        {message.sender === 'loading' ? (
          <div className="message loading p-4 rounded-lg">
            <div className="message-content">
              <p className="text-gray-600 dark:text-gray-400">{message.text}</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`message ${message.sender} max-w-[90%] md:max-w-[80%] ${message.sender === 'user' ? 'ml-auto' : ''}`}>
              <div className={`message-content p-3 md:p-4 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-100 dark:bg-blue-900' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {renderBotMessageContent(message)}
                <span className="timestamp block text-xs text-right mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {message.sender === 'bot' && message.showFeedback && (
              <div className="feedback-attached mt-1 ml-2">
                <div className="feedback-buttons flex space-x-2">
                  <button 
                    onClick={() => handleFeedback(message.id, 'up')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    👍
                  </button>
                  <button 
                    onClick={() => handleFeedback(message.id, 'down')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    👎
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    ))
  )}
  <div ref={messagesEndRef} />
</div>

      {/* Chat Input */}
      <div className="chat-input-container p-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            className="chat-input flex-1 p-3 rounded-lg border"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your SQL question here..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isBotThinking}
          />
          <button 
            className="send-button px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isBotThinking || inputValue.trim() === ''}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;