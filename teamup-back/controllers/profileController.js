const db = require('../config/db');

const LEVELS = ['beginner', 'intermediate', 'expert'];
const AVAILABILITIES = ['weekday', 'weekend', 'both'];

/* CRUD */

// CREATE
exports.createProfile = async (req, res) => {
    try {
        const {
            user_id,
            fav_sport_id,
            first_name,
            last_name,
            birth_date,
            level,
            availability
        } = req.body;

        if (!LEVELS.includes(level) || !AVAILABILITIES.includes(availability)) {
            return res.status(400).json({ error: 'Données incorrectes' });
        }

        const [result] = await db.execute(
            `INSERT INTO profile 
                (user_id, fav_sport_id, first_name, last_name, birth_date, level, availability, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user_id, fav_sport_id, first_name, last_name, birth_date, level, availability]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ ONE
exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM profile WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fav_sport_id,
            first_name,
            last_name,
            birth_date,
            level,
            availability
        } = req.body;

        if (level && !LEVELS.includes(level)) {
            return res.status(400).json({ error: 'Invalid level value' });
        }
        if (availability && !AVAILABILITIES.includes(availability)) {
            return res.status(400).json({ error: 'Invalid availability value' });
        }

        const [result] = await db.execute(
            `UPDATE profile SET 
                fav_sport_id = COALESCE(?, fav_sport_id),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                birth_date = COALESCE(?, birth_date),
                level = COALESCE(?, level),
                availability = COALESCE(?, availability),
                updated_at = NOW()
            WHERE id = ?`,
            [fav_sport_id, first_name, last_name, birth_date, level, availability, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM profile WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* END OF MAIN CRUD FUNCTIONS */

// CHECK IF PROFILE EXISTS BY USER_ID
exports.profileExistsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query('SELECT id FROM profiles WHERE user_id = ?', [userId]);
        if (rows.length > 0) {
            res.json({ exists: true, profileId: rows[0].id });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};