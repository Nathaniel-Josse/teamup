const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Imports
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const sportController = require('./controllers/sportsController');

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

app.get('/', (req, res) => {
    res.send('Eh mais, ne serait-ce pas le backend de TeamUp ?');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}:${PORT}`);
});