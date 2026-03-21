const express = require('express');
const session = require("express-session");
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes.js');
const unitRoutes = require('./routes/unitRoutes.js');
const inventoryRoutes = require('./routes/inventoryRoute.js');

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "jhaygadgetwow",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,  
    sameSite: "lax"
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/unit', unitRoutes);
app.use('/api/inventory', inventoryRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});