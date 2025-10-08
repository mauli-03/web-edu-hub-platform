const express = require("express");
const Course = require("../models/course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "public/uploads/courses";
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer upload
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    }
});

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Get course by ID
router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Add a new course
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const { title, description, category, features, successPaths, duration } = req.body;
        
        let imagePath = null;
        if (req.file) {
            // If file uploaded, set the image path
            imagePath = `/uploads/courses/${req.file.filename}`;
        }

        const courseData = { 
            title, 
            description, 
            category, 
            duration: duration || "N/A"
        };

        // Add optional fields if they exist
        if (features && typeof features === 'string') {
            courseData.features = features.split(',').map(item => item.trim());
        }
        
        if (successPaths && typeof successPaths === 'string') {
            courseData.successPaths = successPaths.split(',').map(item => item.trim());
        }
        
        if (imagePath) {
            courseData.image = imagePath;
        }

        const newCourse = new Course(courseData);
        await newCourse.save();
        
        res.status(201).json({ 
            message: "Course added successfully!", 
            course: newCourse 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Start course session (Placeholder API)
router.post("/:id/start", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        res.status(200).json({ message: `Course "${course.title}" session started!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
