const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
//const dotenv = require('dotenv');
const axios = require('axios');
//dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default';

exports.signup = async (req, res) => {
    const { email, password, subrole, recaptchaToken } = req.body;
    const role = 'user'; // By default, all users are 'user' role
    if (!email || !password) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    // reCAPTCHA check
    if (!recaptchaToken) {
        return res.status(400).json({ message: "reCAPTCHA manquant." });
    }
    try {
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const verifyUrl = process.env.RECAPTCHA_VERIFY_URL;

        const verifyResponse = await axios.post(
            verifyUrl,
            new URLSearchParams({
                secret: recaptchaSecret,
                response: recaptchaToken,
                ...(verifyUrl ? { remoteip: verifyUrl } : {})
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        if (!verifyResponse.data.success) {
            return res.status(400).json({ message: "Échec de la vérification reCAPTCHA." });
        }

        // Check if the email is already in use / if the user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email déjà utilisé' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();
        await db.query(
            'INSERT INTO users (id, email, password, role, subrole) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, role, subrole]
        );
        res.status(201).json({ message: 'User créé', userId: id });
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email ou mot de passe manquant(s).' });
    }
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role, subrole: user.subrole },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log(`User ${user.email} logged in successfully with role ${user.role} and subrole ${user.subrole}`);
        res.json({ 
            body: {
                token,
                user: { id: user.id, email: user.email, role: user.role, subrole: user.subrole }
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, subrole } = req.body;
    if (!id) {
        return res.status(400).json({ message: "ID utilisateur manquant." });
    }
    try {
        const fields = [];
        const values = [];
        if (email) {
            fields.push("email = ?");
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push("password = ?");
            values.push(hashedPassword);
        }
        if (subrole) {
            fields.push("subrole = ?");
            values.push(subrole);
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
        }
        values.push(id);
        await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
        res.json({ message: "Utilisateur mis à jour." });
    } catch (err) {
        res.status(500).json({ message: "Erreur de serveur.", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID utilisateur manquant." });
    }
    try {
        const [users] = await db.query('SELECT id, email, role, subrole FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: "Erreur de serveur.", error: err.message });
    }
}