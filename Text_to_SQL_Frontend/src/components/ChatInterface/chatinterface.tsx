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
  style?: React.CSSProperties; // Add this line
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
      onToggleVisualization( messageId, e);
    } else {
      // Fallback to local state management if prop not provided
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
          <p>{message.text}</p>
          <div className="response-toggle-container">
            <div className="response-toggle-buttons">
              <button 
                onClick={(e) => handleToggleVisualization(message.id, e)}
                className={`toggle-btn ${!message.showVisualization ? 'active' : ''}`}
              >
                Show Query
              </button>
              <button 
                onClick={(e) => handleToggleVisualization(message.id, e)}
                className={`toggle-btn ${message.showVisualization ? 'active' : ''}`}
              >
                Show Visualization
              </button>
            </div>
            
            {message.showVisualization ? (
              <div className="visualization-container">
                {message.visualization ? (
                  <img src={message.visualization} alt="Data visualization" />
                ) : (
                  <div className="visualization-placeholder">
                    Visualization would appear here
                  </div>
                )}
              </div>
            ) : (
              <div className="sql-query">
                <pre>{message.sqlQuery}</pre>
                <button 
                  className="copy-sql-btn" 
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
    return <p>{message.text}</p>;
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
    <div className={`chat-interface ${currentTheme}`}>
      {/* Fixed App Header */}
      <div className="app-header">
        <h1 className="app-title">Text to SQL</h1>
      </div>

      {/* Chat Header with Action Buttons */}
      <div className="chat-header">
        <div className="chat-title-container">
          {isEditingTitle ? (
            <div className="title-edit-container">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                onBlur={handleSaveTitle}
                autoFocus
                className="title-edit-input"
                aria-label="Edit chat title"
                placeholder="Enter chat title"
                title="Edit chat title"
              />
            </div>
          ) : (
            <h3 
              className="chat-title" 
              onClick={() => setIsEditingTitle(true)}
            >
              {currentChatTitle.length > 30 
                ? `${currentChatTitle.substring(0, 30)}...` 
                : currentChatTitle}
            </h3>
          )}
        </div>
        <div className="action-buttons">
          <button 
            onClick={() => setIsEditingTitle(true)} 
            className="action-btn" 
            title="Edit Chat Title"
          >
            <FiEdit />
          </button>
          <button onClick={onTranslate} className="action-btn" title="Translate">
            <FiGlobe />
          </button>
          <button onClick={onToggleTheme} className="action-btn" title="Toggle Theme">
            {currentTheme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <button onClick={onProfileClick} className="action-btn" title="Profile">
            <FiUser />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {localMessages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome to your new chat! Start typing to begin the conversation.</p>
            <p>You can ask questions about your database schema or request SQL queries.</p>
          </div>
        ) : (
          localMessages.map((message) => (
            <div key={message.id} className={`message-wrapper ${message.sender}`}>
              {message.sender === 'loading' ? (
                <div className="message loading">
                  <div className="message-content">
                    <p>{message.text}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`message ${message.sender}`}>
                    <div className="message-content">
                      {renderBotMessageContent(message)}
                      <span className="timestamp">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {message.sender === 'bot' && message.showFeedback && (
                    <div className="feedback-attached">
                      <span className="feedback-prompt">Was this response helpful?</span>
                      <div className="feedback-buttons">
                        <button onClick={() => handleFeedback(message.id, 'up')}>👍</button>
                        <button onClick={() => handleFeedback(message.id, 'down')}>👎</button>
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
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your SQL question here..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isBotThinking}
        />
        <button 
          className="send-button" 
          onClick={handleSendMessage}
          disabled={isBotThinking || inputValue.trim() === ''}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;