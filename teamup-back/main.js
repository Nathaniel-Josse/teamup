const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const csrf = require('csurf');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// CSRF protection middleware (use after bodyParser and cors)
const csrfProtection = csrf({ cookie: false });

// Example route to get CSRF token (frontend should call this to get the token)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Imports
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const sportController = require('./controllers/sportsController');
const eventController = require('./controllers/eventController');
const userEventController = require('./controllers/userEventController');

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

// Read-only routes (no CSRF needed)
app.get('/api/users/:id', userController.getUserById);
app.get('/api/profiles/:id', profileController.getProfileById);
app.get('/api/profiles/user/:userId', profileController.profileExistsByUserId);
app.get('/api/sports', sportController.getAllSports);
app.get('/api/sports/:id', sportController.getSportById);
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/:id', eventController.getEventById);
app.get('/api/events/:eventId/users/:userId/registered', userEventController.isUserRegisteredForEvent);

app.get('/', (req, res) => {
    res.send('Eh mais, ne serait-ce pas le backend de TeamUp ?');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}:${PORT}`);
});