const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1245',
    database: 'jhaygadget_db'
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed: ', error);
    } else {
        console.log('MySQL Connected!');
    }
})

module.exports = db;