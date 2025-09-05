const express = require('express');
const cors = require('cors');
//const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Redis = require('ioredis');

//dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

if (process.env.NODE_ENV === 'production') {
    const redisClient = new Redis(process.env.REDIS_URL);
    const redisStore = new RedisStore({ client: redisClient });

    app.use(
        session({
            store: redisStore,
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: true,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 day
            },
        })
    );
} else {
    app.use(session({
        secret: 'a-super-secret-key-for-dev-omg-who-cares',
        resave: false,
        saveUninitialized: false,
    }));
}

// CSRF protection middleware (use after bodyParser and cors)
const csrfProtection = csrf({
    cookie: true
});

// Route to get CSRF token (frontend should call this to get the token)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    console.log("CSRF token generated:", csrfToken);
    res.json({ csrfToken });
});

// Imports
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const sportController = require('./controllers/sportsController');
const eventController = require('./controllers/eventController');
const userEventController = require('./controllers/userEventController');
const chatController = require('./controllers/chatController');

// Routes

// Public routes (no CSRF needed)
app.post('/api/signup', userController.signup);
app.post('/api/login', userController.login);

// Protected routes (CSRF needed)
app.put('/api/users/:id', csrfProtection, userController.updateUser);
app.post('/api/profiles', csrfProtection, profileController.createProfile);
app.put('/api/profiles/:id', csrfProtection, profileController.updateProfile);
app.delete('/api/profiles/:id', csrfProtection, profileController.deleteProfile);

app.post('/api/sports', csrfProtection, sportController.createSport);
app.delete('/api/sports/:id', csrfProtection, sportController.deleteSport);

app.post('/api/events', csrfProtection, eventController.uploadEventPicture, eventController.createEvent);
app.put('/api/events/:id', csrfProtection, eventController.uploadEventPicture, eventController.updateEvent);
app.delete('/api/events/:id', csrfProtection, eventController.deleteEvent);

app.post('/api/events/:eventId/register', csrfProtection, userEventController.registerForEvent);
app.delete('/api/events/:eventId/users/:userId/unregister', csrfProtection, userEventController.unregisterFromEvent);

app.post('/api/chat/rooms', csrfProtection, chatController.createChatRoom);
app.put('/api/chat/rooms/:id', csrfProtection, chatController.updateChatRoom);
app.delete('/api/chat/rooms/:id', csrfProtection, chatController.deleteChatRoom);

app.post('/api/chat/rooms/:roomId/messages', csrfProtection, chatController.createMessage);
app.delete('/api/chat/rooms/:roomId/messages/:messageId', csrfProtection, chatController.deleteMessage);

app.post('/api/chat/rooms/:roomId/members', csrfProtection, chatController.addRoomMember);
app.delete('/api/chat/rooms/:roomId/members/:userId', csrfProtection, chatController.removeRoomMember);

// Read-only routes (no CSRF needed)
app.get('/api/users/:id', userController.getUserById);
app.get('/api/profiles/:id', profileController.getProfileById);
app.get('/api/profiles/user/:userId', profileController.profileExistsByUserId);
app.get('/api/sports', sportController.getAllSports);
app.get('/api/sports/:id', sportController.getSportById);
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/:id', eventController.getEventById);
app.get('/api/events/:eventId/users/:userId/registered', userEventController.isUserRegisteredForEvent);
app.get('/api/events/:eventId/users/:userId/all', userEventController.getAllUsersRegisteredForEvent);
app.get('/api/chat/rooms', chatController.getChatRooms);
app.get('/api/chat/rooms/:id', chatController.getChatRoomById);
app.get('/api/chat/rooms/:roomId/messages', chatController.getMessagesByRoom);
app.get('/api/chat/rooms/:roomId/members', chatController.getRoomMembers);
app.get('/api/chat/rooms/user/:userId', chatController.getRoomsForUser);

app.get('/', (req, res) => {
    res.send('Eh mais, ne serait-ce pas le backend de TeamUp ?');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}:${PORT}`);
});