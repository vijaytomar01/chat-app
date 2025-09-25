const express = require('express');
const path = require('path');

const app = express();

// Middleware
// Basic request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('Invalid JSON received:', buf.toString());
            const err = new Error('Invalid JSON');
            err.statusCode = 400;
            throw err;
        }
    }
}));

// Body logging after JSON parsing
app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Global error handler for JSON parsing errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        console.error('JSON parsing error:', error.message);
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    next(error);
});

// Simple message storage (in production, use a database)
let messages = [];
let users = [];

// Routes
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', (req, res) => {
    try {
        const { username, message } = req.body;
        
        if (!username || !message) {
            return res.status(400).json({ error: 'Username and message are required' });
        }

        // Validate input types and lengths
        if (typeof username !== 'string' || typeof message !== 'string') {
            return res.status(400).json({ error: 'Username and message must be strings' });
        }

        if (username.trim().length === 0 || message.trim().length === 0) {
            return res.status(400).json({ error: 'Username and message cannot be empty' });
        }

        if (username.length > 20 || message.length > 1000) {
            return res.status(400).json({ error: 'Username too long (max 20 chars) or message too long (max 1000 chars)' });
        }

        const newMessage = {
            id: Date.now(),
            username: username.trim(),
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);
        
        // Keep only the last 100 messages
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }

        res.json(newMessage);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users/join', (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Validate input type and length
        if (typeof username !== 'string') {
            return res.status(400).json({ error: 'Username must be a string' });
        }

        if (username.trim().length === 0) {
            return res.status(400).json({ error: 'Username cannot be empty' });
        }

        if (username.length < 2 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be between 2 and 20 characters' });
        }

        const user = {
            id: Date.now(),
            username: username.trim(),
            joinedAt: new Date().toISOString()
        };

        users.push(user);
        res.json(user);
    } catch (error) {
        console.error('Error processing user join:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;