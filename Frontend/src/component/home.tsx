// src/components/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!roomId) {
      setError('Room ID cannot be empty');
      return;
    }
    // Try to create the room using WebSocket connection
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'create', payload: { roomId } }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
      } else {
        navigate(`/chat/${roomId}`, { state: { socket } });
      }
    };
  };

  const handleJoinRoom = async () => {
    if (!roomId) {
      setError('Room ID cannot be empty');
      return;
    }
    // Try to join the room
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', payload: { roomId } }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
      } else {
        navigate(`/chat/${roomId}`, { state: { socket } });
      }
    };
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Chat Room</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="w-full p-2 bg-blue-500 text-white rounded mb-2"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>
        <button
          className="w-full p-2 bg-green-500 text-white rounded"
          onClick={handleJoinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
