const db = require('../config/db.js');
const bcrypt = require('bcryptjs');

exports.register = async(req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO admin_user (username, password) VALUES (?, ?)`;

    db.query(sql, [username, hashedPassword], (error, result) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        res.status(201).json({ message: 'User registered'});
    })
}

exports.getMe = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated'});
    }

    res.json({
        user: req.session.user
    })
}