import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/sidebar/sidebar';
import ChatInterface from './components/ChatInterface/chatinterface';
import { Message, Chat } from './components/types';

const App: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [nextChatNumber, setNextChatNumber] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Create initial chat when component mounts
  useEffect(() => {
    const initialChatId = `chat-${Date.now()}`;
    setActiveChatId(initialChatId);
    setChats([{
      id: initialChatId,
      title: 'New Chat',
      messages: [],
      selected: false
    }]);
  }, []);

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setActiveChatId(newChatId);
    setChats(prev => [...prev, {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      selected: false
    }]);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleToggleChatSelect = (chatId: string, selected: boolean) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, selected } : chat
    ));
  };

  const handleUpdateChatTitle = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleToggleVisualization = (messageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, showVisualization: !msg.showVisualization } 
              : msg
          )
        };
      }
      return chat;
    }));
  };

  const handleMessageSent = (chatId: string, message: Message) => {
    setChats(prev => {
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(chat => chat.id === chatId);

      if (chatIndex === -1) return prev;

      let newMessages = [...updatedChats[chatIndex].messages];

      if (message.sender === 'loading') {
        newMessages = newMessages.filter(m => !m.id.includes('-loading'));
      }
      else if (message.sender === 'bot') {
        newMessages = newMessages.filter(m => !m.id.includes('-loading'));
      }

      newMessages.push(message);

      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        messages: newMessages
      };

      if (updatedChats[chatIndex].title === 'New Chat' && message.sender === 'user') {
        updatedChats[chatIndex].title = `Chat ${nextChatNumber}: ${
          message.text.length > 30 
            ? `${message.text.substring(0, 30)}...` 
            : message.text
        }`;
        setNextChatNumber(n => n + 1);
      }

      return updatedChats;
    });
  };

  const handleDdlContentChange = (content: string) => {
    console.log('DDL content updated:', content);
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };

  const handleTranslate = () => {
    console.log('Translate button clicked');
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleProfileClick = () => {
    console.log('Profile button clicked');
  };

  const getActiveChatMessages = () => {
    const activeChat = chats.find(chat => chat.id === activeChatId);
    return activeChat ? activeChat.messages : [];
  };
  useEffect(()=>{
    console.log(isSidebarOpen)
  },[])

  return (
    <div className={`app-container ${theme} w-full`}>
      {/* Mobile menu button - only shows on small screens */}
      <button 
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 dark:bg-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
  
      {/* Sidebar - responsive behavior */}
      {/* {` */}
        {/* ${isSidebarOpen ? 'w-full sm:w-1/4 lg:w-1/5' : 'w-0 sm:w-16 lg:w-20'} 
        transition-all duration-300 ease-in-out
        fixed sm:relative z-40 h-screen
      `} */}
      <div className={`
        ${isSidebarOpen ? 'lg:w-[35%] xl:w-[18%]' : ' md:w-[8%] lg:w-[8%] xl:w-[4%]'} 
        transition-all duration-300 ease-in-out
        fixed sm:relative z-40 h-screen
      `}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          chats={chats}
          activeChatId={activeChatId}
          onToggleChatSelect={handleToggleChatSelect}
          onDdlContentChange={handleDdlContentChange}
          onFileUpload={handleFileUpload}
        />
      </div>
  
      {/* Main content - responsive behavior */}
      <main className={`
      w-full ${isSidebarOpen ? 'w-full md:ml-[25%] lg:ml-0' : 'w-[60%] xl:ml-2'}
        transition-all duration-300 ease-in-out
        h-screen overflow-hidden flex z-0
      `}>
        <div className="chat-interface-wrapper h-full">
          {activeChatId && (
            <ChatInterface 
              key={activeChatId}
              chatId={activeChatId}
              messages={getActiveChatMessages()}
              onMessageSent={handleMessageSent}
              onTranslate={handleTranslate}
              onToggleTheme={handleToggleTheme}
              onProfileClick={handleProfileClick}
              currentTheme={theme}
              onUpdateChatTitle={handleUpdateChatTitle}
              currentChatTitle={chats.find(chat => chat.id === activeChatId)?.title || 'New Chat'}
              onToggleVisualization={handleToggleVisualization}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;