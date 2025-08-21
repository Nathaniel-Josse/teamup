const db = require('../config/db');
const { formatDateFromDB } = require('../helpers/formatDateFromDB');

// CHAT ROOMS CRUD
exports.createChatRoom = async (req, res) => {
    const { name, user } = req.body;
    console.log("Creating chat room with req:");
    console.dir(req);
    try {
        const [result] = await db.query(
            'INSERT INTO chat_rooms (name, created_at, updated_at) VALUES (?, NOW(), NOW())',
            [name]
        );
        const roomId = result.insertId;
        await this.addRoomMember({ body: { room_id: roomId, user_id: user } }, { status: () => ({ json: () => {} }) });
        const [rows] = await db.query('SELECT * FROM chat_rooms WHERE id = ?', [roomId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getChatRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM chat_rooms');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getChatRoomById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM chat_rooms WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateChatRoom = async (req, res) => {
    const { name } = req.body;
    try {
        await db.query(
            'UPDATE chat_rooms SET name = ?, updated_at = NOW() WHERE id = ?',
            [name, req.params.id]
        );
        const [rows] = await db.query('SELECT * FROM chat_rooms WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteChatRoom = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM chat_rooms WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM chat_rooms WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted', room: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ROOM MEMBERS CRUD
exports.addRoomMember = async (req, res) => {
    console.log("Adding room member:", req.body);
    const { room_id, user_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO room_members (room_id, user_id) VALUES (?, ?)',
            [room_id, user_id]
        );
        const memberId = result.insertId;
        const [rows] = await db.query(`SELECT * FROM room_members WHERE id = ?`, [memberId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRoomMembers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
              room_members.id,
              profiles.first_name,
              profiles.last_name
            FROM room_members
            JOIN users ON room_members.user_id = users.id
            JOIN profiles ON users.id = profiles.user_id
            WHERE room_members.room_id = ?`, [req.params.roomId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRoomMemberIdByUserId = async (req, res) => {
    const { user_id, room_id } = req.params;
    try {
        const [rows] = await db.query('SELECT id FROM room_members WHERE user_id = ? AND room_id = ?', [user_id, room_id]);
        if (rows.length === 0) return res?.status(404).json({ error: 'Not found' });
        if (res) {
            res.json(rows[0]);
        }
        return rows[0].id;
    } catch (err) {
        res?.status(500).json({ error: err.message });
    }
};

exports.removeRoomMember = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM room_members WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM room_members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted', member: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// MESSAGES CRUD
exports.createMessage = async (req, res) => {
    const { roomMemberId, content } = req.body;
    console.log("Creating message with req:", req.body);
    if (content.length > 1000) return res?.status(400).json({ error: 'Content too long' });
    console.log("a");
    try {
        const [result] = await db.query(
            'INSERT INTO messages (room_member_id, content) VALUES (?, ?)',
            [roomMemberId, content]
        );
        console.log("b: ", result);
        const messageId = result.insertId;
        const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
        console.log("c: ", rows);
        if (res) {
            res.status(201).json(rows[0]);
        }
        return rows[0];
    } catch (err) {
        console.error('Error creating message:', err);
        res?.status(500).json({ error: err.message });
    }
};

exports.getMessagesByRoom = async (req, res) => {
    const roomId = req.params.roomId;
    const timezone = req.query.timezone;

    if (!roomId) {
        return res.status(400).json({ message: 'Room ID is required.' });
    }

    try {
        const query = `
            SELECT
                m.id,
                m.content,
                m.created_at,
                p.first_name,
                p.last_name,
                rm.room_id
            FROM
                messages m
            JOIN
                room_members rm ON m.room_member_id = rm.id
            JOIN
                users u ON rm.user_id = u.id
            JOIN
                profiles p ON u.id = p.user_id
            WHERE
                rm.room_id = ?
            ORDER BY
                m.created_at ASC
            LIMIT 100
        `;
        const [rows] = await db.query(query, [roomId]);
        rows.forEach(element => {
            element.created_at = formatDateFromDB(element.created_at, timezone);
        });
        res.status(200).json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted', msg: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// OTHERS

exports.getRoomsForUser = async (req, res) => {
    const userId = req.params.userId;
    const [rows] = await db.query(
        'SELECT room_id, name FROM room_members JOIN chat_rooms ON room_members.room_id = chat_rooms.id WHERE user_id = ?',
        [userId]
    );
    if(res) {
        return res.json(rows);
    }
    return rows;
}