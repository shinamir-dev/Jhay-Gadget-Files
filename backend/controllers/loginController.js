const db = require('../config/db.js');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM admin_user WHERE username = ?`;

  db.query(sql, [username], async (error, result) => {

    if (error) {
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.json({
      message: 'Login Successfully!',
      user: req.session.user
    });

  });
};