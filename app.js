const express = require("express");
const app = express();
const path = require('path');
const indexRouter = require("./routes/index")
const http = require("http")
const socketIO = require("socket.io")

const server = http.createServer(app);  //http ka ek server banaya, jisme express ki sari functionality hai 
const io = socketIO(server);

let waitingusers = [];
let rooms = {};

io.on("connection", function(socket){   //here socket contains the details of the person 
    socket.on("joinroom", function (){
        if(waitingusers.length > 0){
            let partner = waitingusers.shift();//it will remove the 1st element from array and add it to partner
            const roomname = `${socket.id}-${partner.id}`;
            socket.join(roomname);          
            partner.join(roomname);
            io.to(roomname).emit("joined",roomname);//this message will be emitted , to the room above; //sending roomname on frontend
        }
        else{
            waitingusers.push(socket);
        }
    });
    socket.on("message",function(data){
        socket.broadcast.to(data.room).emit("message", data.message); //socket.broadcast will send it to everyone in the data.room except sender , data.message will be sent
    })

    socket.on("disconnect", function(){
     let index = waitingusers.findIndex(waitingUser => waitingUser.id === socket.id)  //.findIndex() is an array method in JavaScript that returns the index of the first element that matches the condition you provide in the callback function.
     waitingusers.splice(index, 1)  //remove that index from the array  
})
});

app.set("view engine","ejs")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.use("/", indexRouter);

server.listen(3000); //express bhi live hogaya , or socket.io bhi live hogaya 