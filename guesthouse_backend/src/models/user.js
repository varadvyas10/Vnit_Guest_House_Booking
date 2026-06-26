const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin', 'superadmin'],
        default: 'student'
    },
    institutionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        enum: [
            'Computer Science and Engineering (CSE)',
            'Computer Science and Engineering (Artificial Intelligence and Data Science)',
            'Electronics and Communication Engineering (ECE)',
            'Electronics Engineering (VLSI Design and Technology)',
            'Electrical and Electronics Engineering (EEE)',
            'Mechanical Engineering',
            'Civil Engineering',
            'Chemical Engineering',
            'Metallurgical and Materials Engineering',
            'Mining Engineering',
            'Engineering Physics'
        ]
    },
    phone: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);