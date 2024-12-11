import { WebSocket,WebSocketServer } from "ws";

const wSS =new WebSocketServer({port:8080});

interface User {
    socket:WebSocket,
    room:string
}

const allSockets:User[]=[];

wSS.on("connection", (socket)=>{
    console.log("New Client Connected");

    socket.on("message", (message: { toString: () => string; })=>{
        try {
            const parsedMessage=JSON.parse(message.toString());
            const {type,payload}=parsedMessage;

            switch (type){
                case "create":
                    handleCreateRoom(socket,payload.roomId);
                    break;
                   
                case "join":
                    handleJoinRoom(socket,payload.roomId);
                    break;

                case "chat":
                    handleChat(socket,payload.message);
                    break;

                default:
                    console.warn("Unkown message type:",type);
                    socket.send(JSON.stringify({error:"invalid message format"}));    
            }

        } catch (err) {
            console.error("Error processing message:",err);
            socket.send(JSON.stringify({error:"Invalid message format"}));
        }
    });

    socket.on("close",()=>{
        handleSocketClose(socket);
    });

});

function handleCreateRoom(socket:WebSocket,roomId:string){
    const roomExists =allSockets.some((user)=> user.room === roomId);
    if(!roomExists){
        allSockets.push({socket,room:roomId});
        socket.send(JSON.stringify({message:"Room created",roomId}));
        console.log("room created",roomId);
    }
    else{
        socket.send(JSON.stringify({error:"Room already exists"}));
    }
}

function handleJoinRoom(socket:WebSocket,roomId:string){
    const roomExists =allSockets.some((user)=>user.room === roomId)
    if(roomExists){
        allSockets.push({socket,room:roomId});
        socket.send(JSON.stringify({message:"Room joined",roomId}));
        console.log("room joined",roomId);
    }
    else{
        socket.send(JSON.stringify({error:"room does not found"}));
    }
}

function handleChat(socket:WebSocket,chatMessage:string){
    const userRoom=allSockets.find((user)=>user.socket ===socket)?.room;
    if(userRoom){
        allSockets.forEach((client)=>{
            if(client.room === userRoom && client.socket.readyState === WebSocket.OPEN){
                client.socket.send(JSON.stringify({message:chatMessage}));
                console.log(chatMessage)
            }
        })
    }else{
        socket.send(JSON.stringify({error:"user is not in any room"}));
    }
}

function handleSocketClose(socket:WebSocket){
       const userIndex=allSockets.findIndex((user)=>user.socket === socket);
       if(userIndex != -1){
        const userRoom=allSockets[userIndex].room;
        console.log(`Client discnnected from:${userRoom}`)
        allSockets.splice(userIndex,1);
       } 
}