const express = require('express');
const cors = require('cors');
//const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const session = require('express-session');
const connectRedis = require('connect-redis');
const Redis = require('ioredis');

//dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const RedisStore = connectRedis(session);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - make sure credentials work properly
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token'],
    exposedHeaders: ['X-CSRF-Token'], // Allow frontend to read CSRF token from headers
}));

// Session configuration
let sessionConfig = {
    secret: process.env.SESSION_SECRET || 'a-super-secret-key-for-dev-omg-who-cares',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production', // ADD THIS LINE
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
};

if (process.env.NODE_ENV === 'production') {
    const redisClient = new Redis(process.env.REDIS_URL);
    
    // Handle Redis connection errors
    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    const redisStore = new RedisStore({ client: redisClient });
    
    sessionConfig.store = redisStore;
    
    // Make sure you have a proper session secret
    if (!process.env.SESSION_SECRET) {
        console.error('Warning: SESSION_SECRET not set in production!');
    }
}

app.use(session(sessionConfig));

// More secure CSRF protection - store token in httpOnly cookie, 
// but also provide it via API for headers
const csrfProtection = csrf({
    cookie: {
        httpOnly: true, // ✅ More secure - token stored in httpOnly cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    value: (req) => {
        return req.body?._csrf || 
               req.query?._csrf || 
               req.headers['x-csrf-token'] || 
               req.headers['csrf-token'];
    }
});

// Route to get CSRF token for header-based submission
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    console.log("CSRF token generated:", csrfToken);
    
    // Send token ONLY in response body for use in headers
    // The cookie is httpOnly and automatically handled
    res.json({ csrfToken });
});

// Add a middleware to log CSRF token issues for debugging
// Use a more specific route pattern to avoid path-to-regexp issues
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(req.method) && 
        req.path !== '/api/signup' && req.path !== '/api/login') {
        console.log('CSRF Debug Info:');
        console.log('- Method:', req.method);
        console.log('- Path:', req.path);
        console.log('- CSRF Token from header:', req.get('X-CSRF-Token') || req.get('x-csrf-token'));
        console.log('- CSRF Token from body:', req.body?._csrf);
        console.log('- Session ID:', req.sessionID);
        console.log('- Cookies:', Object.keys(req.cookies));
    }
    next();
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

// Error handling middleware
app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
        console.error('CSRF Token Error:', {
            method: req.method,
            path: req.path,
            sessionID: req.sessionID,
            headers: req.headers,
            body: req.body
        });
        res.status(403).json({ 
            error: 'Invalid CSRF token',
            message: 'Please refresh the page and try again'
        });
    } else {
        next(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}:${PORT}`);
});