import { useEffect, useRef, useState } from "react";
import "./App.css";
import Home from "./component/home";
import { nanoid } from "nanoid";

function App() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const refInput = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  interface AppState {
    roomId: string;
    roomJoined: boolean;
    messageReceived: boolean;
    allMessages: string[];
  }
  const [state, setState] = useState<AppState>({
    roomId: "",
    roomJoined: false,
    messageReceived: false,
    allMessages: [],
  });

  useEffect(() => {
    const connectSocket = () => {
      const socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (message) => {
        const newMessage = message.data;
        console.log("new msg", newMessage)
        setState((prev) => ({
          ...prev,
          allMessages: [...prev.allMessages, newMessage],
        }));

      };

      socket.onerror = (error) => {
        console.error("WebSocket error", error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed, reconnecting...");
        setTimeout(connectSocket, 5000);
      };

      wsRef.current = socket;
    };

    connectSocket(); 

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleCreateRoom = () => {
    const generatedId = nanoid(10);
    setState((prev) => ({ ...prev, roomId: generatedId }));
    if (!generatedId) {
      console.error("Room ID required to create");
      alert("Room ID required to create");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "create",
          payload: { roomId: generatedId },
        })
      );
    } else {
      console.log("WebSocket connection is not open yet");
    }
  };

  function setRoomId(tempId:string){
    setState((prev)=>({...prev,roomId:tempId}))
  }

  const handleJoin = () => {
    const { roomId } = state;
    if (!roomId) {
      console.error("Room ID required to join");
      alert("Room ID required to create");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: { roomId },
        })
      );
      wsRef.current.onmessage = (message) => {
        if (message.data === "404") {
          setState((prev) => ({ ...prev, messageReceived: false }));
        } else {
          setState((prev)=>({
            ...prev,
          allMessages:[...prev.allMessages,message.data]
          }))
          setState((prev) => ({ ...prev, messageReceived: true }));
        }
      };
    }
  };

  const handleMsg = () => {
    if (refInput.current) {
      const inputValue = refInput.current.value;
      console.log(inputValue);
      if (inputValue && wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat",
            payload: { message: inputValue },
          })
        );
        refInput.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (state.messageReceived) {
      setState((prev) => ({ ...prev, roomJoined: true }));
    }
  }, [state.messageReceived]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.allMessages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleMsg();
    }
  };

  const { roomId, roomJoined, allMessages } = state;

  return (
    <>
      {!roomJoined ? (
        <Home
          roomId={roomId}
          handleJoin={handleJoin}
          handleCreateRoom={handleCreateRoom}
          setRoomId={setRoomId}
        />
      ) : (
        <div>
          <div className="h-[90vh] bg-black p-10">
            <div className="h-full w-full rounded-lg flex flex-col gap-2 overflow-y-auto p-5">
              {allMessages.map((msg, index) => (
                <div key={index} className="bg-white px-2 py-1 max-w-max rounded-lg">
                  {msg}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
          </div>
          <div className="h-[10vh] flex justify-between items-center px-2 gap-2">
            <input
              type="text"
              ref={refInput}
              className="bg-gray-300 rounded-md w-full focus:outline-none h-[8vh]"
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleMsg}
              className="px-4 text-white bg-black hover:bg-gray-800 h-8 rounded-full"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
