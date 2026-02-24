const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
    try {
        await mongoose.connect(config.DB_URL);
        console.log("✅ MongoDB Connected Locally");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;