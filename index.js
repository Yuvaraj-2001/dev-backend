import express from 'express';
import mysql  from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json({ limit: '1gb' }));
app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT;

const pool = mysql.createPool({
    host: process.env.DB_HOST, // Replace with your database host (e.g., '192.168.1.1' or 'sql123456.hostinger.com')
    user:  process.env.DB_USER, // Replace with your database username
    password: process.env.DB_PASSWORD, // Replace with your database password
    database: process.env.DB_NAME, // Replace with your database name
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
// ✅ Route to insert a new collection using async/await
app.post('/collections', async (req, res) => {
    const { title, topics_id } = req.body;

    if (!title || !topics_id) {
        return res.status(400).json({ error: 'Title and topics_id are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO collections (title, topics_id) VALUES (?, ?)',
            [title, topics_id]
        );
        res.status(201).json({ message: 'Collection added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET request to retrieve all collections using async/await

app.get('/collections', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM collections');
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/collectionsById/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await pool.query('SELECT * FROM collections Where topics_id = ?', [id]);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ✅ PUT request to update a collection by id using async/await
app.put('/collections/:id', async (req, res) => {
    const { id } = req.params;
    const { title, topics_id } = req.body;

    if (!title || !topics_id) {
        return res.status(400).json({ error: 'Title and topics_id are required' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE collections SET title = ?, topics_id = ? WHERE id = ?',
            [title, topics_id, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.status(200).json({ message: 'Collection updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE request to remove a collection by id using async/await
app.delete('/collections/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM collections WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/blogs', async (req, res) => {
    const { collections_id, content, heading } = req.body;
    
    if (!collections_id || !heading || !content) {
        return res.status(400).json({ error: 'collection_id,  heading and content are required' });
    }

    try {
        const jsonContent = JSON.stringify(content);
        console.log(jsonContent);
        const [result] = await pool.query(
            'INSERT INTO blogs (heading, content, collections_id) VALUES (?, ?, ?)',
            [heading, jsonContent, collections_id]
        );
        res.status(201).json({ message: 'blog added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

app.get('/blogs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM blogs where collections_id = ?', [id]);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});