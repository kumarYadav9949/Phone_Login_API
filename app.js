const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API endpoint for adding a customer
app.post('/api/customers', (req, res) => {
  const { name, phoneNumber } = req.body;

  // Validate input parameters
  if (!name || !phoneNumber) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  // Check for duplicates
  const query = 'SELECT * FROM customers WHERE phone_number = ?';
  connection.query(query, [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error querying the database: ' + err.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    // Insert the customer into the database
    const insertQuery = 'INSERT INTO customers (name, phone_number) VALUES (?, ?)';
    connection.query(insertQuery, [name, phoneNumber], (err, result) => {
      if (err) {
        console.error('Error inserting the customer: ' + err.stack);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ message: 'Customer added successfully' });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
