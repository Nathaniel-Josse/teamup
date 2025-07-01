const db = require('../config/db');

// Create a new sport
exports.createSport = async (req, res) => {
    try {
        const { label } = req.body;
        if (!label) {
            return res.status(400).json({ message: 'Label is required.' });
        }
        const [result] = await db.execute('INSERT INTO sports (label) VALUES (?)', [label]);
        const [sport] = await db.execute('SELECT * FROM sports WHERE id = ?', [result.insertId]);
        res.status(201).json(sport[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all sports
exports.getAllSports = async (req, res) => {
    try {
        const [sports] = await db.execute('SELECT * FROM sports');
        res.json(sports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single sport by id
exports.getSportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [sports] = await db.execute('SELECT * FROM sports WHERE id = ?', [id]);
        if (sports.length === 0) {
            return res.status(404).json({ message: 'Sport not found.' });
        }
        res.json(sports[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a sport by id
exports.deleteSport = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM sports WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sport not found.' });
        }
        res.json({ message: 'Sport deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};