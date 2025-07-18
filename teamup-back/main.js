const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Imports
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const sportController = require('./controllers/sportsController');
const eventController = require('./controllers/eventController');
const userEventController = require('./controllers/userEventController');

// Routes
app.post('/api/signup', userController.signup);
app.post('/api/login', userController.login);
app.put('/api/users/:id', userController.updateUser);
app.get('/api/users/:id', userController.getUserById);

app.post('/api/profiles', profileController.createProfile);
app.get('/api/profiles/:id', profileController.getProfileById);
app.put('/api/profiles/:id', profileController.updateProfile);
app.delete('/api/profiles/:id', profileController.deleteProfile);
app.get('/api/profiles/user/:userId', profileController.profileExistsByUserId);

app.post('/api/sports', sportController.createSport);
app.get('/api/sports', sportController.getAllSports);
app.get('/api/sports/:id', sportController.getSportById);
app.delete('/api/sports/:id', sportController.deleteSport);

app.post('/api/events', eventController.uploadEventPicture, eventController.createEvent);
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/:id', eventController.getEventById);
app.put('/api/events/:id', eventController.uploadEventPicture, eventController.updateEvent);
app.delete('/api/events/:id', eventController.deleteEvent);

app.post('/api/events/:eventId/register', userEventController.registerForEvent);
app.get('/api/events/:eventId/users/:userId/registered', userEventController.isUserRegisteredForEvent);
app.delete('/api/events/:eventId/users/:userId/unregister', userEventController.unregisterFromEvent);

app.get('/', (req, res) => {
    res.send('Eh mais, ne serait-ce pas le backend de TeamUp ?');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}:${PORT}`);
});