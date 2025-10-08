const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/Blog");
const User = require("../models/User"); // Add User model
const auth = require("../middleware/auth"); // Import auth middleware

const router = express.Router();

// Set up storage for blog images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "./public/uploads/blogs";
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'blog-' + uniqueSuffix + ext);
    },
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    } 
});

// Create a new blog (requires auth)
router.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        const { title, content, summary, tags } = req.body;
        
        // Process image
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/blogs/${req.file.filename}`;
        }

        // Process tags
        const blogTags = tags ? JSON.parse(tags) : [];

        const newBlog = new Blog({
            title,
            content,
            summary: summary || content.substring(0, 150) + '...',
            image: imageUrl,
            author: req.user.id,
            tags: blogTags
        });

        await newBlog.save();

        // Populate author details before sending response
        const populatedBlog = await Blog.findById(newBlog._id)
            .populate('author', 'name email avatar')
            .lean();

        res.status(201).json({ 
            success: true,
            message: "Blog created successfully!", 
            blog: populatedBlog 
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to create blog",
            message: error.message
        });
    }
});

// Fetch all blogs with pagination, sorting, and filtering (public route)
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || "latest";
        const tag = req.query.tag || null;
        const search = req.query.search || null;
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        
        // Filter by tag if provided
        if (tag) {
            query.tags = tag;
        }
        
        // Filter by search term if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Only show published blogs
        query.status = 'published';
        
        // Set up sorting
        let sortOption = {};
        switch (sort) {
            case "latest":
                sortOption = { createdAt: -1 };
                break;
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
            case "popular":
                sortOption = { views: -1 };
                break;
            case "title":
                sortOption = { title: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Count total blogs matching the query
        const total = await Blog.countDocuments(query);
        
        if (total === 0) {
            return res.json({
                success: true,
                blogs: [],
                currentPage: page,
                totalPages: 0,
                totalBlogs: 0
            });
        }

        // Fetch blogs with author details
        const blogs = await Blog.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'author',
                select: 'name email avatar',
                model: 'User'
            })
            .select('-comments') // Exclude comments to reduce payload size
            .lean();
        
        const totalPages = Math.ceil(total / limit);
        
        // Add absolute URLs to images
        const blogsWithAbsoluteUrls = blogs.map(blog => {
            if (blog.image && !blog.image.startsWith('http')) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                blog.image = `${baseUrl}${blog.image}`;
            }
            return blog;
        });
        
        res.json({
            success: true,
            blogs: blogsWithAbsoluteUrls,
            currentPage: page,
            totalPages,
            totalBlogs: total
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch blogs",
            message: error.message 
        });
    }
});

// Update a blog (requires auth)
router.put("/:id", auth, upload.single("image"), async (req, res) => {
    try {
        const { title, content, summary, tags, status } = req.body;
        
        // Check if the blog exists
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                error: "Blog not found" 
            });
        }

        // Check authorization (only author can update)
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                error: "Not authorized to update this blog" 
            });
        }

        // Process image
        let imageUrl = blog.image; // Keep existing image by default
        if (req.file) {
            // If there's a new image, update the URL
            imageUrl = `/uploads/blogs/${req.file.filename}`;
            
            // Remove old image if it exists
            if (blog.image && !blog.image.startsWith('http') && fs.existsSync(`./public${blog.image}`)) {
                fs.unlinkSync(`./public${blog.image}`);
            }
        }

        // Process tags
        const blogTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : blog.tags;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { 
                title, 
                content, 
                summary: summary || content.substring(0, 150) + '...',
                image: imageUrl,
                tags: blogTags,
                status: status || blog.status
            },
            { new: true }
        ).populate({
            path: 'author',
            select: 'name email avatar',
            model: 'User'
        });

        // Add absolute URL to image
        const response = updatedBlog.toObject();
        if (response.image && !response.image.startsWith('http')) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            response.image = `${baseUrl}${response.image}`;
        }

        res.json({ 
            success: true,
            message: "Blog updated successfully!", 
            blog: response 
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to update blog",
            message: error.message
        });
    }
});

// Delete a blog (requires auth)
router.delete("/:id", auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                error: "Blog not found" 
            });
        }

        // Check authorization (only author can delete)
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                error: "Not authorized to delete this blog" 
            });
        }

        // Remove image file if it exists
        if (blog.image && !blog.image.startsWith('http') && fs.existsSync(`./public${blog.image}`)) {
            fs.unlinkSync(`./public${blog.image}`);
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.json({ 
            success: true,
            message: "Blog deleted successfully!" 
        });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to delete blog",
            message: error.message
        });
    }
});

// Get a single blog by ID with full details (public route)
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate({
                path: 'author',
                select: 'name email avatar bio',
                model: 'User'
            })
            .populate({
                path: 'comments.user',
                select: 'name avatar',
                model: 'User'
            })
            .lean();
            
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                error: "Blog not found" 
            });
        }

        // Increment views
        await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        
        // Add absolute URL to image
        if (blog.image && !blog.image.startsWith('http')) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            blog.image = `${baseUrl}${blog.image}`;
        }
        
        // Fetch related blogs (same author or same tags)
        const relatedBlogs = await Blog.find({
            _id: { $ne: blog._id }, // Exclude current blog
            $or: [
                { author: blog.author._id },
                { tags: { $in: blog.tags } }
            ],
            status: 'published'
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title createdAt image')
        .lean();
        
        // Add absolute URLs to related blog images
        const relatedBlogsWithUrls = relatedBlogs.map(relatedBlog => {
            if (relatedBlog.image && !relatedBlog.image.startsWith('http')) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                relatedBlog.image = `${baseUrl}${relatedBlog.image}`;
            }
            return relatedBlog;
        });
        
        res.json({
            success: true,
            blog,
            relatedBlogs: relatedBlogsWithUrls
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch blog",
            message: error.message
        });
    }
});

// Add a comment to a blog (no auth required, but validates inputs)
router.post("/:id/comments", async (req, res) => {
    try {
        const { name, email, content } = req.body;
        
        // Validate inputs
        if (!name || !email || !content) {
            return res.status(400).json({
                success: false,
                error: "Please provide name, email and comment content"
            });
        }
        
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found"
            });
        }
        
        // Create comment
        const newComment = {
            name,
            email,
            content,
            createdAt: new Date()
        };
        
        // Add user reference if authenticated
        if (req.user) {
            newComment.user = req.user.id;
        }
        
        blog.comments.push(newComment);
        await blog.save();
        
        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({
            success: false,
            error: "Failed to add comment",
            message: error.message
        });
    }
});

// Get tags summary (counts of blogs per tag)
router.get("/tags/summary", async (req, res) => {
    try {
        const tagCounts = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            tags: tagCounts
        });
    } catch (error) {
        console.error("Error fetching tag summary:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch tag summary",
            message: error.message
        });
    }
});

module.exports = router;
