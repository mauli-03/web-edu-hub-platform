const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get syllabus by course
router.get("/:courseId", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM syllabus WHERE course_id = $1", [req.params.courseId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
