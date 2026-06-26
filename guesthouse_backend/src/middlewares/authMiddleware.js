const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user context from database and strip out password fields
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Authorization Denied: Account context deleted.' });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Authorization Denied: Corrupted or expired signature token.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Authorization Denied: Missing access credentials string.' });
    }
};


const authorize = (...permittedRoles) => {
    return (req, res, next) => {
        if (!req.user || !permittedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: Your access tier (${req.user?.role || 'Guest'}) is insufficient to execute this operation.` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };