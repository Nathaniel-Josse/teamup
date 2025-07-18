const db = require('../config/db');

// Inscription d'un utilisateur à un événement
exports.registerForEvent = async (req, res) => {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    try {
        // Vérifie si l'utilisateur est déjà inscrit à l'événement
        const [existing] = await db.query('SELECT * FROM user_event WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Utilisateur déjà inscrit à cet événement' });
        }
        await db.query('INSERT INTO user_event (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
        res.status(201).json({ message: 'Inscription à l\'événement réussie' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
};

exports.isUserRegisteredForEvent = async (req, res) => {
    const { userId, eventId } = req.params;
    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    try {
        const [registration] = await db.query('SELECT * FROM user_event WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (registration.length > 0) {
            return res.json({ registered: true });
        } else {
            return res.json({ registered: false });
        }
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
}

// Désinscription d'un utilisateur d'un événement
exports.unregisterFromEvent = async (req, res) => {
    const { userId, eventId } = req.params;
    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    try {
        // Vérifie si l'utilisateur est inscrit à l'événement
        const [existing] = await db.query('SELECT * FROM user_event WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }
        await db.query('DELETE FROM user_event WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        res.status(200).json({ message: 'Désinscription réussie' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
}