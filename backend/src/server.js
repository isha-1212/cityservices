// ...existing code...
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from backend/src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[CONFIGURED]' : '[NOT SET]');
// import wishlistRouter from "./routes/wishlist.js"; // Commented out - routes directory doesn't exist
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import fsSync from 'fs';
import { parse as csvParse } from 'csv-parse';

const app = express();

// Enable CORS for all origins in development
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] // Update for production
        : true, // Allow all origins in development
    credentials: true
}));

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

// Recommendations endpoint - returns mock data for now
app.get('/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    const n = parseInt(req.query.n) || 6;
    
    console.log(`Fetching ${n} recommendations for user ${userId}`);
    
    try {
        // Mock recommendations data - in production this would use ML/recommendation algorithms
        const mockRecommendations = [
            {
                id: 'rec-1',
                name: 'Gujarati Thali House',
                category: 'food',
                area: 'Navrangpura',
                rating: 4.5,
                price: '250',
                image: '/api/placeholder/300/200',
                association_confidence: 0.85,
                popularity_score: 92
            },
            {
                id: 'rec-2', 
                name: 'Budget Stay PG',
                category: 'accommodation',
                area: 'Paldi',
                rating: 4.2,
                price: '8000',
                image: '/api/placeholder/300/200',
                bookmarked_by_users: 45,
                popularity_score: 78
            },
            {
                id: 'rec-3',
                name: 'Home Style Tiffin',
                category: 'tiffin',
                area: 'Satellite',
                rating: 4.7,
                price: '3500',
                image: '/api/placeholder/300/200',
                association_confidence: 0.92,
                popularity_score: 95
            },
            {
                id: 'rec-4',
                name: 'City Metro Transport',
                category: 'transport',
                area: 'All Areas',
                rating: 4.0,
                price: '50',
                image: '/api/placeholder/300/200',
                bookmarked_by_users: 120,
                popularity_score: 88
            },
            {
                id: 'rec-5',
                name: 'WorkSpace Hub',
                category: 'coworking',
                area: 'SG Highway',
                rating: 4.3,
                price: '5000',
                image: '/api/placeholder/300/200',
                association_confidence: 0.78,
                popularity_score: 71
            },
            {
                id: 'rec-6',
                name: 'Quick Utilities Service',
                category: 'utilities',
                area: 'Ahmedabad',
                rating: 4.1,
                price: '500',
                image: '/api/placeholder/300/200',
                bookmarked_by_users: 35,
                popularity_score: 65
            }
        ];

        // Return only the requested number of recommendations
        const recommendations = mockRecommendations.slice(0, n);
        
        res.json({
            status: 'success',
            recommendations,
            count: recommendations.length,
            user_id: userId
        });
        
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recommendations'
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

// Endpoint to seed services data from mockServices
// import { mockServices } from '../src/data/mockServices'; // Commented out - file is empty

/*
app.post('/api/services/seed', authenticateToken, async (req, res) => {
    try {
        // Validate prices and data
        for (const service of mockServices) {
            if (service.price <= 0) {
                return res.status(400).json({ error: `Invalid price for service ${service.id}` });
            }
        }
        // Upsert services
        for (const service of mockServices) {
            await pool.query(
                `INSERT INTO services (id, name, type, city, price, rating, description, image, features, meta)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                 ON CONFLICT (id) DO UPDATE SET
                   name = EXCLUDED.name,
                   type = EXCLUDED.type,
                   city = EXCLUDED.city,
                   price = EXCLUDED.price,
                   rating = EXCLUDED.rating,
                   description = EXCLUDED.description,
                   image = EXCLUDED.image,
                   features = EXCLUDED.features,
                   meta = EXCLUDED.meta`,
                [
                    service.id,
                    service.name,
                    service.type,
                    service.city,
                    service.price,
                    service.rating,
                    service.description,
                    service.image,
                    JSON.stringify(service.features),
                    JSON.stringify(service.meta || {})
                ]
            );
        }
        res.json({ message: 'Services seeded successfully' });
    } catch (err) {
        console.error('Seed services error:', err);
        res.status(500).json({ error: 'Failed to seed services' });
    }
});

// Endpoint to get bookmarked services with details
app.get('/api/bookmarks/services', authenticateToken, async (req, res) => {
    try {
        const bookmarksResult = await pool.query(
            'SELECT service_id FROM bookmarks WHERE user_id = $1',
            [req.user.id]
        );
        const serviceIds = bookmarksResult.rows.map(row => row.service_id);
        if (serviceIds.length === 0) {
            return res.json({ services: [] });
        }
        const servicesResult = await pool.query(
            `SELECT * FROM services WHERE id = ANY($1::varchar[])`,
            [serviceIds]
        );
        res.json({ services: servicesResult.rows });
    } catch (err) {
        console.error('Get bookmarked services error:', err);
        res.status(500).json({ error: 'Failed to fetch bookmarked services' });
    }
});

// Endpoint to compute budget estimate
app.post('/api/budget/estimate', authenticateToken, async (req, res) => {
    try {
        const { bookmarkIds, budget } = req.body;
        if (!Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
            return res.status(400).json({ error: 'Please select at least one item.' });
        }
        if (typeof budget !== 'number' || budget <= 0) {
            return res.status(400).json({ error: 'Invalid budget value.' });
        }

        // Validate bookmarkIds exist in services
        const servicesResult = await pool.query(
            `SELECT * FROM services WHERE id = ANY($1::varchar[])`,
            [bookmarkIds]
        );
        const services = servicesResult.rows;
        const foundIds = new Set(services.map(s => s.id));
        const invalidIds = bookmarkIds.filter(id => !foundIds.has(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid service IDs: ${invalidIds.join(', ')}` });
        }

        // Calculate total monthly cost
        const totalMonthly = services.reduce((sum, s) => sum + parseFloat(s.price), 0);

        // Group by category
        const breakdownMap = new Map();
        for (const s of services) {
            if (!breakdownMap.has(s.type)) {
                breakdownMap.set(s.type, { total: 0, items: [] });
            }
            const entry = breakdownMap.get(s.type);
            entry.total += parseFloat(s.price);
            entry.items.push({ id: s.id, name: s.name, category: s.type, price: parseFloat(s.price) });
        }

        // Calculate percentages
        const breakdown = [];
        for (const [category, data] of breakdownMap.entries()) {
            breakdown.push({
                category,
                total: data.total,
                percent: (data.total / totalMonthly) * 100,
                items: data.items
            });
        }

        const withinBudget = budget >= totalMonthly;
        const diff = budget - totalMonthly;

        // Suggestions for over budget categories
        let suggestions = {};
        if (!withinBudget) {
            // For each category, find cheaper alternatives not selected
            for (const [category, data] of breakdownMap.entries()) {
                const currentItems = data.items;
                // Get all services in category not selected
                const altResult = await pool.query(
                    `SELECT * FROM services WHERE type = $1 AND id != ALL($2::varchar[]) AND price < ALL(SELECT price FROM services WHERE id = ANY($2::varchar[])) ORDER BY price ASC LIMIT 3`,
                    [category, bookmarkIds]
                );
                const alternatives = altResult.rows;

                // Filter helpful suggestions
                const helpfulSuggestions = [];
                for (const alt of alternatives) {
                    for (const current of currentItems) {
                        if (alt.price < current.price) {
                            const savings = current.price - alt.price;
                            if (savings > 0) {
                                helpfulSuggestions.push({
                                    replaceId: current.id,
                                    suggestionId: alt.id,
                                    name: alt.name,
                                    price: alt.price,
                                    savings
                                });
                            }
                        }
                    }
                }
                if (helpfulSuggestions.length > 0) {
                    suggestions[category] = helpfulSuggestions.slice(0, 3);
                }
            }
        }

        // Format currency values with thousand separators for display
        function formatCurrency(value) {
            return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
        }

        res.json({
            totalMonthly: formatCurrency(totalMonthly),
            breakdown: breakdown.map(b => ({
                category: b.category,
                total: formatCurrency(b.total),
                percent: b.percent.toFixed(2),
                items: b.items.map(i => ({
                    id: i.id,
                    name: i.name,
                    category: i.category,
                    price: formatCurrency(i.price)
                }))
            })),
            withinBudget,
            diff: formatCurrency(diff),
            suggestions
        });
    } catch (err) {
        console.error('Budget estimate error:', err);
        res.status(500).json({ error: 'Failed to compute budget estimate' });
    }
});

// Endpoint to save budget plan
app.post('/api/budget/plans', authenticateToken, async (req, res) => {
    try {
        const { name, bookmarkIds, budget, totalCost } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Plan name is required' });
        }
        if (!Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
            return res.status(400).json({ error: 'Please select at least one item.' });
        }
        if (typeof budget !== 'number' || budget <= 0) {
            return res.status(400).json({ error: 'Invalid budget value.' });
        }
        if (typeof totalCost !== 'number' || totalCost < 0) {
            return res.status(400).json({ error: 'Invalid total cost value.' });
        }

        const result = await pool.query(
            `INSERT INTO budget_plans (user_id, name, bookmark_ids, budget, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [req.user.id, name, JSON.stringify(bookmarkIds), budget, totalCost]
        );
        res.status(201).json({ planId: result.rows[0].id });
    } catch (err) {
        console.error('Save budget plan error:', err);
        res.status(500).json({ error: 'Failed to save budget plan' });
    }
});
*/
