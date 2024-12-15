const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON request bodies

// Enable CORS
app.use(cors()); // Allow all origins by default

// Optional: Customize CORS (e.g., allow specific origins)
app.use(cors({
  origin: 'http://localhost:8000', // Replace with the URL where your frontend is served
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

console.log('Database Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




// const express = require('express');
// const mysql = require('mysql2');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// let dbConnected = false; // Variable to track database connection status

// // Test database connection
// db.getConnection((err, connection) => {
//   if (err) {
//     console.error('Error connecting to the database:', err.message);
//   } else {
//     console.log('Connected to the MySQL database');
//     dbConnected = true;
//     connection.release();
//   }
// });

// // Basic test route
// app.get('/', (req, res) => {
//   if (dbConnected) {
//     res.send('Server is running and connected to the database!');
//   } else {
//     res.status(500).send('Server is running, but there is a database connection error.');
//   }
// });

// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });




// const express = require('express');
// const mysql = require('mysql2');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// app.use(express.json());

// // Database connection
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Test database connection
// db.getConnection((err, connection) => {
//   if (err) {
//     console.error('Error connecting to the database:', err.message);
//   } else {
//     console.log('Connected to MySQL database');
//     connection.release();
//   }
// });

// // // Signup route
// // app.post('/signup', (req, res) => {
// //   const { firebaseUid, email } = req.body;

// //   const query = 'INSERT INTO users (firebase_uid, email) VALUES (?, ?)';
// //   db.query(query, [firebaseUid, email], (err, results) => {
// //     if (err) {
// //       console.error('Error adding user:', err.message);
// //       return res.status(500).json({ error: 'Failed to add user' });
// //     }
// //     res.status(201).json({ message: 'User added successfully', userId: results.insertId });
// //   });
// // });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });