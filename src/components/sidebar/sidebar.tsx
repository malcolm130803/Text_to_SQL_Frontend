import { useState } from 'react';
import "./sidebar.css";
import { FiUpload, FiFileText, FiChevronLeft, FiMenu, FiPlus } from "react-icons/fi";
import { BiHistory } from "react-icons/bi";

interface Chat {
  id: string;
  title: string;
  selected?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  chats: Chat[];
  activeChatId: string;
  className?: string;
  onToggleChatSelect: (chatId: string, selected: boolean) => void;
  onDdlContentChange: (content: string) => void;
  onFileUpload: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  onSelectChat, 
  onNewChat,
  chats,
  activeChatId,
  onDdlContentChange,
  onFileUpload
}) => {
  const [ddlContent, setDdlContent] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setDdlContent(content);
        onDdlContentChange(content);
      };
      reader.readAsText(file);
      onFileUpload(file);
    }
  };

  const handleDdlContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setDdlContent(content);
    onDdlContentChange(content);
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "collapsed"} h-full ${isOpen ? 'w-full' : 'w-0'} sm:w-auto`}>
      <button onClick={toggleSidebar} className="toggle-btn">
        {isOpen ? <FiChevronLeft className="toggle-icon" /> : <FiMenu className="toggle-icon" />}
      </button>

      <div className="sidebar-content">
        {isOpen && (
          <>
            <div className="sidebar-section ddl-content">
              <label htmlFor="ddl-content" className="sidebar-label">
                <FiFileText className="icon" /> DDL Content
              </label>
              <textarea 
                id="ddl-content" 
                placeholder="  Enter DDL content..."
                value={ddlContent}
                onChange={handleDdlContentChange}
              ></textarea>
            </div>

            <div className="sidebar-section upload-section">
              <label htmlFor="ddl-file" className="sidebar-label">
                <FiUpload className="icon" /> Upload DDL File
              </label>
              <label htmlFor="ddl-file" className="file-input-label">
                Click to Upload SQL File
              </label>
              <input 
                type="file" 
                id="ddl-file" 
                className="file-input"
                accept=".sql,.txt"
                onChange={handleFileChange}
              />
            </div>

            <div className="sidebar-section chat-history">
              <div className="chat-history-header">
                <h3><BiHistory className="icon" /> Chat History</h3>
                <button className="new-chat-btn" onClick={onNewChat}>
                  <FiPlus className="icon" /> New Chat
                </button>
              </div>
              <div className="chat-history-list">
                {chats.length === 0 ? (
                  <div className="welcome-message">
                    No chat history yet
                  </div>
                ) : (
                  <ul>
                    {chats.map((chat) => (
                      <li key={chat.id}>
                        <button 
                          onClick={() => onSelectChat(chat.id)}
                          className={`chat-item ${chat.id === activeChatId ? 'active-chat' : ''}`}
                        >
                          {chat.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { Sidebar };