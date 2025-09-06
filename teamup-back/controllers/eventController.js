const db = require('../config/db');
const path = require('path');
const multer = require('multer');
const geolib = require('geolib');

// Multer setup for /uploads folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Export multer middleware for use in routes
exports.uploadEventPicture = upload.single('picture');

// Create a new event
exports.createEvent = async (req, res) => {
    console.log("Creating event with body:", req.body);
    console.log("Uploaded file:", req.file); // Add this for debugging
    
    const {
        organizer_user_id,
        sport_id,
        title,
        starting_date,
        ending_date,
        location,
        lat,
        lon,
        max_attendees,
        status,
        description
    } = req.body;

    // Handle picture upload - only use uploaded file, ignore blob URLs
    let picture = null;
    if (req.file) {
        picture = `/uploads/${req.file.filename}`;
        console.log("Picture set to:", picture); // Debug log
    }
    // Remove the fallback to req.body.picture as it contains invalid blob URL

    // Validate required fields
    if (
        !organizer_user_id ||
        !sport_id ||
        !title ||
        !starting_date ||
        !ending_date ||
        !location ||
        !lat ||
        !lon ||
        !max_attendees ||
        !status
    ) {
        return res.status(400).json({ message: 'Champs manquants' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO events (
                organizer_user_id, sport_id, title, starting_date, ending_date, location, lat, lon, max_attendees, status, description, picture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                organizer_user_id,
                sport_id,
                title,
                starting_date,
                ending_date,
                location,
                lat,
                lon,
                max_attendees,
                status,
                description,
                picture
            ]
        );
        
        console.log("Event created successfully with ID:", result.insertId); // Debug log
        res.status(201).json({ 
            message: 'Événement créé', 
            picture,
            eventId: result.insertId 
        });
    } catch (err) {
        console.error("Database error:", err); // Add detailed error logging
        res.status(500).json({ message: 'Erreur de serveur.', error: err.message });
    }
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events ORDER BY status ASC, starting_date ASC');
        
        // If the user provided lat and lon, we calculate the distance to each event
        const { lat: userLat, lon: userLon } = req?.query;
        if (userLat && userLon) {
            const userLocation = { latitude: parseFloat(userLat), longitude: parseFloat(userLon) };
            events.forEach(event => {
                const eventLocation = { latitude: parseFloat(event.lat), longitude: parseFloat(event.lon) };
                event.distance = geolib.getDistance(userLocation, eventLocation); // distance in meters
            });
            // Sort events by distance
            events.sort((a, b) => a.distance - b.distance);
        }
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Erreur de serveur.', error: err.message });
    }
};

// Get a single event by id
exports.getEventById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID événement manquant." });
    }
    try {
        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        if (events.length === 0) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }
        res.json(events[0]);
    } catch (err) {
        res.status(500).json({ message: "Erreur de serveur.", error: err.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    const {
        sport_id,
        title,
        starting_date,
        ending_date,
        location,
        lat,
        lon,
        max_attendees,
        status,
        description,
        userId
    } = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID événement manquant." });
    }

    // Check if user is authorized
    if (!userId) {
        return res.status(403).json({ message: "Utilisateur non autorisé." });
    }

    try {
        const [event] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        if (event.length === 0) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }
        if (event[0].organizer_user_id !== userId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet événement." });
        }

        // Handle picture upload - only use uploaded file, ignore blob URLs
        let picture = null;
        if (req.file) {
            picture = `/uploads/${req.file.filename}`;
        }
        // Don't use req.body.picture as fallback for blob URLs

        const fields = [];
        const values = [];
        if (sport_id) { fields.push("sport_id = ?"); values.push(sport_id); }
        if (title) { fields.push("title = ?"); values.push(title); }
        if (starting_date) { fields.push("starting_date = ?"); values.push(starting_date); }
        if (ending_date) { fields.push("ending_date = ?"); values.push(ending_date); }
        if (location) { fields.push("location = ?"); values.push(location); }
        if (lat) { fields.push("lat = ?"); values.push(lat); }
        if (lon) { fields.push("lon = ?"); values.push(lon); }
        if (max_attendees) { fields.push("max_attendees = ?"); values.push(max_attendees); }
        if (status) { fields.push("status = ?"); values.push(status); }
        if (description) { fields.push("description = ?"); values.push(description); }
        if (picture) { fields.push("picture = ?"); values.push(picture); }

        if (fields.length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
        }

        values.push(id);
        await db.query(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`, values);
        
        res.json({ message: "Événement mis à jour.", picture });
    } catch (err) {
        console.error("Update event error:", err); // Add error logging
        res.status(500).json({ message: "Erreur de serveur.", error: err.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    // We check if the user is the organizer of the event
    if (!userId) {
        return res.status(403).json({ message: "Utilisateur non autorisé." });
    }
    if (!id) {
        return res.status(400).json({ message: "ID événement manquant." });
    }
    try {
        const [event] = await db.query('SELECT * FROM events WHERE id = ?', [id]);

        if (event.length === 0) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }
        if (event[0].organizer_user_id !== userId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet événement." });
        }

        const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }

        await db.query('DELETE FROM user_event WHERE event_id = ?', [id]);
        
        res.json({ message: "Événement supprimé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur de serveur.", error: err.message });
    }
}