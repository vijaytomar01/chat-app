const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Simple message storage (in production, use a database)
let messages = [];
let users = [];

// Routes
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', (req, res) => {
    const { username, message } = req.body;
    
    if (!username || !message) {
        return res.status(400).json({ error: 'Username and message are required' });
    }

    const newMessage = {
        id: Date.now(),
        username,
        message,
        timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    
    // Keep only the last 100 messages
    if (messages.length > 100) {
        messages = messages.slice(-100);
    }

    res.json(newMessage);
});

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users/join', (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const user = {
        id: Date.now(),
        username,
        joinedAt: new Date().toISOString()
    };

    users.push(user);
    res.json(user);
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;