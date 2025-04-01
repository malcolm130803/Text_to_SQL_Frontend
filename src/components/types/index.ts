export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'loading';
  timestamp: Date;
  showFeedback?: boolean;
  sqlQuery?: string;
  visualization?: string;  // Add this line
  showVisualization?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  selected?: boolean;
}