const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON request bodies

// Enable CORS
// app.use(cors()); // Allow all origins by default

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:5500', 
      'http://127.0.0.1:5500',
      'https://jasonlpapadopoulos-github-io.onrender.com',
      'https://makeplana.com',
      'https://www.makeplana.com'  // Include www subdomain just in case
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // For debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Origin:', req.headers.origin);
  res.status(500).json({ error: 'Internal server error' });
});

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the process if the connection fails
  } else {
    console.log('Connected to the MySQL database!');
    connection.release();
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Example signup route
app.post('/signup', (req, res) => {
    const { firebaseUid, email, firstName } = req.body;
  
    if (!firebaseUid || !email || !firstName) {
      return res.status(400).json({ error: 'firebaseUid, email, and firstName are required' });
    }
  
    const query = 'INSERT INTO users (firebase_uid, email, first_name) VALUES (?, ?, ?)';
    db.query(query, [firebaseUid, email, firstName], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err.message);
        return res.status(500).json({ error: 'Failed to add user to database' });
      }
      res.status(201).json({ message: 'User added successfully', userId: results.insertId });
    });
  });

app.get('/api/food', (req, res) => {
    db.query('SELECT * FROM food', (err, results) => {
        if (err) {
            res.status(500).send('Error querying the database');
            return;
        }
        res.json(results);  // Send results as JSON
    });
});

app.get('/api/drinks', (req, res) => {
    db.query('SELECT * FROM drinks', (err, results) => {
        if (err) {
            res.status(500).send('Error querying the database');
            return;
        }
        res.json(results);  // Send results as JSON
    });
});

// Add this route to your server.js
app.get('/get-user', (req, res) => {
  const firebaseUid = req.query.firebaseUid;

  if (!firebaseUid) {
    return res.status(400).json({ error: 'Firebase UID is required' });
  }

  const query = 'SELECT first_name FROM users WHERE firebase_uid = ?';
  db.query(query, [firebaseUid], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ firstName: results[0].first_name });
  });
});

app.use(express.static('public'));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
