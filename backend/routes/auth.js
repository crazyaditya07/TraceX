const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '7d',
    });
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company, role, roles, walletAddress } = req.body;

        // Validation
        if (!name || !email || !password || !walletAddress) {
            return res.status(400).json({ message: 'Name, email, password, and wallet address are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            walletAddress: walletAddress.toLowerCase(),
            company,
            role: role || 'CONSUMER',
            roles: roles || [role || 'CONSUMER'],
            location: req.body.location,
            phone: req.body.phone,
            metadata: req.body.metadata,
            isActive: true,
            registeredAt: new Date()
        });

        // Return user with token
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            role: user.role,
            roles: user.roles,
            walletAddress: user.walletAddress,
            token: generateToken(user._id)
        };

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user has a password (some users might only have wallet auth)
        if (!user.password) {
            return res.status(401).json({ message: 'Please use wallet to sign in' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Return user with token
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            role: user.role,
            roles: user.roles,
            walletAddress: user.walletAddress,
            token: generateToken(user._id)
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
});

// Validate session and get current user
router.get('/me', async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            role: user.role,
            roles: user.roles,
            walletAddress: user.walletAddress
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Session validation error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
});

module.exports = router;
