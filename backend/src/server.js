// ...existing code...
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]');

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import fsSync from 'fs';
import { parse as csvParse } from 'csv-parse';

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Apply SQL schema files on startup so schema is created automatically
async function applySchemas() {
    try {
        const base = path.resolve('./'); // current backend folder
        const files = ['schema.sql', 'bookmarks.sql'];
        for (const file of files) {
            const filePath = path.join(base, file);
            try {
                console.log('Applying schema file:', filePath);
                const sql = await fs.readFile(filePath, 'utf8');
                if (!sql.trim()) {
                    console.warn(`Schema file ${file} is empty, skipping.`);
                    continue;
                }
                // Execute the whole SQL file as a single query (pg supports multiple statements)
                await pool.query(sql);
                console.log(`Applied schema: ${file}`);
            } catch (err) {
                // If file not found, skip with a warning; otherwise show error
                if (err.code === 'ENOENT') {
                    console.warn(`Schema file not found: ${filePath}`);
                } else {
                    console.error(`Error applying schema ${file}:`, err);
                }
            }
        }
    } catch (err) {
        console.error('applySchemas error:', err);
    }
}

// Run schema application before accepting requests
await applySchemas();

// JWT authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Get user profile (protected)
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get all bookmarks for the authenticated user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    console.log('GET /api/bookmarks headers:', req.headers);
    try {
        const result = await pool.query(
            'SELECT id, service_id, created_at FROM bookmarks WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ bookmarks: result.rows });
    } catch (err) {
        console.error('Get bookmarks error:', err);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Add a bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    console.log('POST /api/bookmarks headers:', req.headers);
    console.log('POST /api/bookmarks body:', req.body);
    const { service_id } = req.body;
    if (!service_id) return res.status(400).json({ error: 'service_id is required' });
    try {
        const result = await pool.query(
            'INSERT INTO bookmarks (user_id, service_id) VALUES ($1, $2) RETURNING id, service_id, created_at',
            [req.user.id, service_id]
        );
        console.log('Inserted bookmark:', result.rows[0]);
        res.status(201).json({ bookmark: result.rows[0] });
    } catch (err) {
        console.error('Add bookmark error:', err);
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Remove a bookmark
app.delete('/api/bookmarks/:id', authenticateToken, async (req, res) => {
    console.log('DELETE /api/bookmarks headers:', req.headers);
    console.log('DELETE /api/bookmarks params:', req.params);
    const { id } = req.params;
    try {
        const del = await pool.query('DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        console.log('Delete result:', del.rows);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete bookmark error:', err);
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

// Service search route (public, stub)
app.get('/api/services', async (req, res) => {
    // TODO: Implement service search from DB
    res.json({ services: [] });
});

// Serve tiffin_rental CSV as JSON
app.get('/api/tiffin-rental', async (req, res) => {
    try {
        // Prefer public copy so frontend can fetch directly during dev
        const candidates = [
            path.join(path.resolve('../'), 'public', 'data', 'Food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'public', 'data', 'Food', 'tiffin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'data', 'Food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'data', 'Food', 'tiffin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'food', 'tiffin_rental.csv'),
        ];

        let csvPath = null;
        for (const p of candidates) {
            if (fsSync.existsSync(p)) {
                csvPath = p;
                break;
            }
        }

        if (!csvPath) {
            console.warn('tiffin_rental.csv not found in candidate locations');
            return res.status(404).json({ error: 'tiffin_rental.csv not found' });
        }

        const raw = await fs.readFile(csvPath, 'utf8');
        csvParse(raw, { columns: true, skip_empty_lines: true }, (err, records) => {
            if (err) {
                console.error('CSV parse error:', err);
                return res.status(500).json({ error: 'Failed to parse CSV' });
            }
            res.json(records);
        });
    } catch (err) {
        console.error('Tiffin rental endpoint error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, password_hash]
        );
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(201).json({ token, user });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Sign-in endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const valid = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
