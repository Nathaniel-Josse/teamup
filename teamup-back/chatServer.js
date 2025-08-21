const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { getRoomsForUser, createMessage, getRoomMemberIdByUserId } = require('./controllers/chatController');
const { getProfileByUserId } = require('./controllers/profileController');
const jwt = require('jsonwebtoken');
const { verifyUserToken } = require('./helpers/verifyUserToken');
const { formatDateFromDB } = require('./helpers/formatDateFromDB');
const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Use CORS middleware for the Express app
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Initialize Socket.IO server with CORS enabled
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// The 'connection' event is the core of Socket.IO.
// It fires whenever a new client connects to the server.
io.on('connection', async (socket) => {
    // This logs every time a new socket connects
    console.log(`[INFO] New socket connected with ID: ${socket.id}`);

    const userToken = socket.handshake.auth.token;
    const userId = await verifyUserToken(userToken, jwt);

    if (!userId) {
        console.log(`[AUTH] Failed for socket ID: ${socket.id}. Disconnecting.`);
        return socket.disconnect();
    }

    console.log(`[AUTH] User ${userId} authenticated for socket ID: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`[ROOM] User ${userId} joined room ${roomId}`);
    });

    // Listen for a client to request leaving a room
    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`[ROOM] User ${userId} left room ${roomId}`);
    });

    // This listener should be attached successfully now
    socket.on('send_message', async (data) => {
        console.log(`[MESSAGE] Received message from socket ID: ${socket.id} for room ${data.roomId}. Content of the message is: ${data.content}`);
        const { roomId, userId, content, timezone } = data;

        const userRooms = await getRoomsForUser({ params: { userId: userId } });

        // Verify the user is a member of the room before saving
        const isMember = userRooms.some(room => room.room_id === roomId);
        if (!isMember) {
            console.log(`User ${userId} is not authorized to send messages to room ${roomId}`);
            return;
        }

        try {
            const roomMemberId = await getRoomMemberIdByUserId({ params: { user_id: userId, room_id: roomId } });
            // Save the message to the database
            const savedMessage = await createMessage({ body: { userId: userId, roomMemberId: roomMemberId, content: content } });

            // Get the profile for user's name
            const userProfile = await getProfileByUserId({ params: { userId: userId } });

            const formatedCreatedAt = formatDateFromDB(savedMessage.created_at, timezone);

            const messageToEmit = {
                id: savedMessage.id,
                roomId: roomId,
                content: savedMessage.content,
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                created_at: formatedCreatedAt
            };

            // Broadcast the new message to everyone in the room
            io.to(roomId).emit('new_message', messageToEmit);
            console.log(messageToEmit);
            console.log(`[SUCCESS] Message sent to room ${roomId} by user ${userId}`);

        } catch (error) {
            console.error("Error saving message:", error);
            // You can optionally send an error back to the client
            socket.emit('message_error', 'Failed to send message.');
        }
        
    });

    socket.on('disconnect', (reason) => {
        console.log(`[INFO] Socket ID: ${socket.id} disconnected. Reason: ${reason}`);
    });
});

const PORT = process.env.CHAT_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
});