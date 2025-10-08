const { Pool } = require("pg");
const mongoose = require("mongoose");
require("dotenv").config();

// ✅ PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "educationhub",
    password: process.env.DB_PASSWORD || "172004",
    port: process.env.DB_PORT || 5432,
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1); // Exit process if DB connection fails
    });

// ✅ Test PostgreSQL Database Connection
(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL Database Connected Successfully");
        client.release(); // Release the client after testing
    } catch (err) {
        console.error("❌ PostgreSQL Connection Error:", err.message);
        process.exit(1); // Exit process if DB connection fails
    }
})();

module.exports = { pool, mongoose };
