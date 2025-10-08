const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token, authorization denied' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user by id
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ error: 'Token is valid but user not found' });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token is not valid' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = auth; 