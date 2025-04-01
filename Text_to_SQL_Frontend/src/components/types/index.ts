export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'loading';
    timestamp: Date;
    showFeedback?: boolean;
    sqlQuery?: string;
    visualization?: string; // Could be URL or component name
    showVisualization?: boolean; // Toggle state
  }
  
  export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    selected?: boolean;
  }