const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { getRoomsForUser } = require('./controllers/chatController');
const { verifyUserToken } = require('./helpers/verifyUserToken');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS enabled
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

// The 'connection' event is the core of Socket.IO.
// It fires whenever a new client connects to the server.
io.on('connection', async (socket) => {
    // Extract the token from the handshake auth object
    const userToken = socket.handshake.auth.token;

    const userId = await verifyUserToken(userToken);

    if (!userId) {
        console.log("Authentication failed for a user, disconnecting.");
        return socket.disconnect(); // Disconnect unauthorized clients
    }

    console.log(`User ${userId} connected`);

    // Fetch the rooms the user belongs to from the database
    // This is a crucial database query that uses your `room_members` table
    const userRooms = await getRoomsForUser(userId); // Awaiting the database call

    // Join the user to each of their authorized rooms
    userRooms.forEach(room => {
        socket.join(room.room_id);
        console.log(`User ${userId} joined room ${room.room_id}`);
    });

    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
});

// TODO: Helper function to verify user token and return user ID
// This function must use the same logic as your existing login system


const PORT = process.env.CHAT_PORT;
server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
});