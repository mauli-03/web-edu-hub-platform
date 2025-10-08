const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        // Check if email is taken
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email already in use' });
        
        // Check if username is taken (if provided)
        if (username) {
            user = await User.findOne({ username });
            if (user) return res.status(400).json({ msg: 'Username already taken' });
        }

        // Create username from name if not provided
        const finalUsername = username || name.toLowerCase().replace(/\s+/g, '_');
        
        user = new User({ 
            name, 
            email, 
            password,
            username: finalUsername 
        });
        await user.save();

        // Generate token upon registration
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            msg: 'User registered successfully', 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid Credentials' });

        // Update token to include username
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            msg: 'Login successful', 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Get Current User
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
