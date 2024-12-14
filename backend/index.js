const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const port = process.env.PORT || 3000;
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.get('/', (req, res) => {
    res.send('Successful response.');
});

server.listen(port, () => {
    console.log(`Server running on ${port}`);
});
const clientsInRoom = new Set();

io.on('connect', (socket) => {
    socket.on('join_room', (roomid) => {
        socket.join(roomid);
        clientsInRoom.add(socket.id);

        console.log(`Client joined room: ${roomid}`);
        socket.emit('message', `You have joined room: ${roomid}`);
        if (clientsInRoom.size >= 2) {
            io.to(roomid).emit('both_clients_ready');
        }
        socket.on('send', (msg) => {
            console.log(msg);
            socket.broadcast.to(roomid).emit('receive', msg);
            console.log(1);

        });
        socket.on('sharekey', (key) => {
            console.log(key);
            socket.broadcast.to(roomid).emit('receivekey', key);
            console.log(3)
        });
    })
    console.log("Client connected");
});