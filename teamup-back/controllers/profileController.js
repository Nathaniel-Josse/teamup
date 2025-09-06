const db = require('../config/db');
const dayjs = require('dayjs');

// CONSTANTS DEFINITIONS

const BEGINNER = 'beginner';
const INTERMEDIATE = 'intermediate';
const EXPERT = 'expert';

const WEEKDAY = 'weekday';
const WEEKEND = 'weekend';
const BOTH = 'both';

// We define the associated array of levels with their labels
const LEVELS = [
    { id: BEGINNER, label: 'Débutant' },
    { id: INTERMEDIATE, label: 'Intermédiaire' },
    { id: EXPERT, label: 'Expert' }
];

const AVAILABILITIES = [
    { id: WEEKDAY, label: 'Les jours de semaine' },
    { id: WEEKEND, label: 'En week-end' },
    { id: BOTH, label: 'Aux deux' }
];

/* CRUD */

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

        const levelId = typeof level === 'object' && level.id ? level.id : level;
        const availabilityId = typeof availability === 'object' && availability.id ? availability.id : availability;

        // Validate using the extracted IDs
        if (!LEVELS.map(l => l.id).includes(levelId) || !AVAILABILITIES.map(a => a.id).includes(availabilityId)) {
            return res.status(400).json({ 
                error: 'Données incorrectes',
                details: {
                    validLevels: LEVELS.map(l => l.id),
                    validAvailabilities: AVAILABILITIES.map(a => a.id),
                    receivedLevel: levelId,
                    receivedAvailability: availabilityId
                }
            });
        }

        console.log('Creating profile with data:', {
            user_id,
            fav_sport_id,
            first_name,
            last_name,
            birth_date,
            level,
            availability
        });

        const [result] = await db.query(
            `INSERT INTO profiles 
            SET user_id = ?, fav_sport_id = ?, first_name = ?, last_name = ?, birth_date = ?, level = ?, availability = ?`,
            [user_id, fav_sport_id, first_name, last_name, birth_date, levelId, availabilityId]
        );

        // Add the profile ID to the user
        await db.query('UPDATE users SET profile_id = ? WHERE id = ?', [result.insertId, user_id]);

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM profiles WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });

        // Convert level and availability to their labels
        const profile = rows[0];
        profile.level = { id: profile.level, label: LEVELS.find(l => l.id === profile.level)?.label || profile.level };
        profile.availability = { id: profile.availability, label: AVAILABILITIES.find(a => a.id === profile.availability)?.label || profile.availability };

        // Format birth_date if it exists
        if (profile.birth_date) {
            profile.birth_date = dayjs(profile.birth_date).format('DD/MM/YYYY');
        }

        console.log(profile);

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

        if(!LEVELS.map(l => l.id).includes(level.id) || !AVAILABILITIES.map(a => a.id).includes(availability.id)) {
            return res.status(400).json({ error: 'Invalid level or availability value' });
        }

        const levelId = level.id;
        const availabilityId = availability.id;

        const [result] = await db.query(
            `UPDATE profiles SET 
                fav_sport_id = COALESCE(?, fav_sport_id),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                birth_date = COALESCE(?, birth_date),
                level = COALESCE(?, level),
                availability = COALESCE(?, availability),
                updated_at = NOW()
            WHERE id = ?`,
            [fav_sport_id, first_name, last_name, birth_date, levelId, availabilityId, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM profiles WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* END OF MAIN CRUD FUNCTIONS */

// Check if profile exists by user ID
exports.profileExistsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query('SELECT id FROM profiles WHERE user_id = ?', [userId]);
        if (rows.length > 0) {
            res.json({ exists: true, profile_id: rows[0].id });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
        if (res) res.json(rows[0]);
        return rows[0];
    } catch (err) {
        console.error('Error fetching profile by user ID:', err);
        res?.status(500).json({ error: err.message });
    }
};