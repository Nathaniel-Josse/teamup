const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Imports
const userController = require('./controllers/userController');

// Routes
app.post('/api/signup', userController.signup);
app.post('/api/login', userController.login);
app.post('/api/logout', userController.logout);
app.put('/api/users/:id', userController.updateUser);

app.get('/', (req, res) => {
    res.send('Welcome to TeamUp API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});