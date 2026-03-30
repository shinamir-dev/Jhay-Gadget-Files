const express = require('express');
const session = require("express-session");
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes.js');
const unitRoutes = require('./routes/unitRoutes.js');
const inventoryRoutes = require('./routes/inventoryRoute.js');
const paymentRoutes = require('./routes/paymentRoutes.js')

const app = express();

app.use(cors({
  origin: true,
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
app.use('/api/payment', paymentRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});