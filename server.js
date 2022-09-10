const express = require("express");
var cors = require('cors')
const { Server, Socket } = require("socket.io");
const app = express();
app.use(cors())

const httpServer = app.listen(process.env.PORT||8000);
const io = new Server(httpServer, { cors: { origin: "*" } })
let rooms = {}
io.on("connection",(socket) => {
    console.log("Client Connected", socket.id)
    socket.on("create-room",(roomId)=>{ 
        console.log("room:", roomId)
       let roomIdObj ={
            members : [],
            playerFlag : true
        }
        rooms[roomId] = roomIdObj
    })
    socket.on("join-room",(data)=>{
        if(rooms.hasOwnProperty(data.id)){
            socket.emit("room-status",true)  
            socket.join(data.id)  
            rooms[data.id].members.push(data.user)
             if(rooms[data.id].members.length===2){
                io.in(data.id).emit("waiting-status",false)
            }
            if(rooms[data.id].playerFlag===true){
                io.to(socket.id).emit("set-player","X")
                rooms[data.id].playerFlag = false
            }
           else if(rooms[data.id].playerFlag===false){
            io.to(socket.id).emit("set-player","O")
                rooms[data.id].playerFlag = null
            }
            console.log(`${socket.id} has joined room ${data.id}`)
            console.log(rooms[data.id])
        }
        else{
            socket.emit("room-status",false)
        }
    })
    socket.on("update-matrix",(data)=>{
       rooms[data.id].matrix = data.matrix
       console.log(rooms[data.id].matrix)
       socket.to(data.id).emit("client-update-matrix",data.matrix)
       
   })
  
})