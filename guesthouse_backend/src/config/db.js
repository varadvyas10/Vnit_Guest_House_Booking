const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB Cluster Synced: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Database Connection Intercepted: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;