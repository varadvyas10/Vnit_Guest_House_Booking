const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const issueToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @desc    Register a new platform user account node
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, institutionId, department, phone } = req.body;

        
        if (!name || !email || !password || !institutionId || !department || !phone) {
            return res.status(400).json({ message: 'Missing mandatory registration input fields.' });
        }

        const sanitizedInstitutionId = String(institutionId).trim();

        const existingEmail = await User.findOne({ email });
        const existingId = await User.findOne({ institutionId: institutionId.trim() });

        if (existingEmail || existingId) {
            return res.status(400).json({ message: 'Account conflict: Email or Institution ID already mapped to active user profile.' });
        }

        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student', 
            institutionId: institutionId.trim(),
            department,
            phone
        });

        return res.status(201).json({
            success: true,
            message: 'Identity profile initialized successfully.',
            token: issueToken(newUser._id),
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        res.status(500).json({ error: 'Server Engine Registration Defect', details: error.message });
    }
};

// @desc    Verify incoming login structures and issue cryptographic token hashes
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password keys.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. Profile not verified.' });
        }

        
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid credentials. Profile not verified.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Authentication check cleared.',
            token: issueToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ error: 'Server Engine Login Defect', details: error.message });
    }
};

module.exports = { registerUser, loginUser };