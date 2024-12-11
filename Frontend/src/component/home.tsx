import { useRef } from "react";


interface HomeProps {
  roomId: string;
  handleJoin: () => void;
  handleCreateRoom: () => void;
  setRoomId:(tempId:string)=>void
}

export default function Home({ roomId, handleJoin, handleCreateRoom,setRoomId }: HomeProps) {
const inputRef=useRef<HTMLInputElement>(null);
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[480px] h-[400px] border-2 border-gray-950 rounded-2xl px-1 py-2 flex flex-col gap-4 items-center justify-center">
        <div className="flex gap-2 items-center justify-between border-2 border-gray-700 rounded-full w-full">
          <div className="w-full">{roomId}</div>
          <button
            className="text-white bg-black rounded-full hover:text-black hover:bg-white"
            onClick={handleCreateRoom}
          >
            Create Room 
          </button>
        </div>

        

        <div className="flex gap-2 items-center justify-between border-2 border-gray-700 rounded-full w-full">
          <input
            type="text"
            className="w-full focus:outline-none h-10 hover:bg-gray-200 rounded-full"
            ref={inputRef}
            onChange={()=>{
              let id=inputRef.current?.value;
              setRoomId(id as unknown as string)
            }}
          />
          <button
            className="text-white bg-black rounded-full hover:text-black hover:bg-white"
            onClick={handleJoin}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}



