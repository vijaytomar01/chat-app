const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Store connected users
const users = new Map();

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Handle user joining
    socket.on('join', (username) => {
        users.set(socket.id, {
            id: socket.id,
            username: username,
            joinedAt: new Date()
        });

        // Notify all clients about the new user
        io.emit('user-joined', {
            username: username,
            message: `${username} joined the chat`,
            timestamp: new Date()
        });

        // Send updated user list to all clients
        io.emit('users-list', Array.from(users.values()));

        console.log(`${username} joined the chat`);
    });

    // Handle new messages
    socket.on('message', (data) => {
        const user = users.get(socket.id);
        if (user) {
            const messageData = {
                id: Date.now(),
                username: user.username,
                message: data.message,
                timestamp: new Date()
            };

            // Broadcast message to all connected clients
            io.emit('message', messageData);
            console.log(`Message from ${user.username}: ${data.message}`);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            users.delete(socket.id);

            // Notify all clients about user leaving
            io.emit('user-left', {
                username: user.username,
                message: `${user.username} left the chat`,
                timestamp: new Date()
            });

            // Send updated user list to all clients
            io.emit('users-list', Array.from(users.values()));

            console.log(`${user.username} disconnected`);
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const user = users.get(socket.id);
        if (user) {
            socket.broadcast.emit('user-typing', {
                username: user.username,
                isTyping: data.isTyping
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to start chatting!`);
});