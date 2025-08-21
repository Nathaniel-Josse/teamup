const db = require('../config/db');

exports.registerForEvent = async (req, res) => {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    try {
        // Check if the user is already registered for the event
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

exports.unregisterFromEvent = async (req, res) => {
    const { userId, eventId } = req.params;
    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    try {
        // Check if the user is registered for the event
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

exports.getAllUsersRegisteredForEvent = async (req, res) => {
    const { eventId, userId } = req.params;
    if (!eventId) {
        return res.status(400).json({ message: 'Champs manquants' });
    }
    const isUserTheOrganizer = await db.query('SELECT * FROM events WHERE id = ? AND organizer_user_id = ?', [eventId, userId]);
    if (isUserTheOrganizer.length === 0) {
        return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas l\'organisateur de cet événement.' });
    }
    try {
        const [registrations] = await db.query(`
            SELECT
                user_event.id AS registration_id,
                users.email,
                profiles.first_name,
                profiles.last_name,
                profiles.birth_date
            FROM user_event 
            JOIN users ON user_event.user_id = users.id
            JOIN profiles ON users.id = profiles.user_id
            WHERE user_event.event_id = ?
            ORDER BY
                user_event.created_at ASC`, [eventId]);
        registrations.forEach(element => {
            element.birth_date = new Date(element.birth_date).toLocaleDateString();
        });
        console.log(`Fetched registrations for event ${eventId}:`, registrations);
        res.json({ registrations });
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur. Veuillez contacter l\'administrateur.', error: err.message });
    }
};