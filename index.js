import express from 'express';
import mysql  from 'mysql2/promise';

const app = express();
app.use(express.json());

const PORT = 3300;

const db = mysql.createConnection({
    host: '193.203.184.196', // Replace with your database host (e.g., '192.168.1.1' or 'sql123456.hostinger.com')
    user: 'u816628190_yuvaraj', // Replace with your database username
    password: '=1W#ucDqqM', // Replace with your database password
    database: 'u816628190_yuvidev', // Replace with your database name
});

const pool = mysql.createPool({
    host: '193.203.184.196', // Replace with your database host (e.g., '192.168.1.1' or 'sql123456.hostinger.com')
    user: 'u816628190_yuvaraj', // Replace with your database username
    password: '=1W#ucDqqM', // Replace with your database password
    database: 'u816628190_yuvidev', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10, // Max connections
    queueLimit: 0
});


app.post('/topics', async (req, res) => {
    try {
        console.log(req.body); // Debugging: Check request body

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Topic name is required' });
        }

        const sql = 'INSERT INTO topics (name) VALUES (?)';
        const [result] = await pool.query(sql, [name]);

        res.status(201).json({ message: 'Topic added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Route to fetch all topics
app.get('/topics', async (req, res) => {
    try {
        const sql = 'SELECT * FROM topics';
        const [results] = await pool.query(sql);

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});