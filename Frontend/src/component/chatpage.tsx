// src/components/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const socket = location.state?.socket;

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event:MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      };
    }
  }, [socket]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket?.send(JSON.stringify({ type: 'chat', payload: { message } }));
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80 mt-8 mb-4">
        <h1 className="text-xl font-bold text-center mb-4">Chat Room</h1>
        <div className="h-64 overflow-y-scroll mb-4 border border-gray-300 p-2">
          {messages.map((msg, index) => (
            <div key={index} className="p-2">
              <p>{msg}</p>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="ml-2 p-2 bg-blue-500 text-white rounded"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
