// backend/routes/universityRoutes.js
const express = require('express');
const University = require('../models/University');
const router = express.Router();

// Get all universities with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, name, location, rank } = req.query;
        const filters = { name, location, rank };
        
        const result = await University.getAllUniversities(
            parseInt(page), 
            parseInt(limit),
            filters
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error in GET /universities:', error);
        res.status(500).json({ error: 'Server error fetching universities' });
    }
});

// Get university by ID
router.get('/:id', async (req, res) => {
    try {
        const university = await University.getUniversityById(req.params.id);
        
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        res.json(university);
    } catch (error) {
        console.error('Error in GET /universities/:id:', error);
        res.status(500).json({ error: 'Server error fetching university' });
    }
});

// Create new university
router.post('/', async (req, res) => {
    try {
        const university = await University.createUniversity(req.body);
        res.status(201).json(university);
    } catch (error) {
        console.error('Error in POST /universities:', error);
        res.status(500).json({ error: 'Server error creating university' });
    }
});

// Update university
router.put('/:id', async (req, res) => {
    try {
        const university = await University.updateUniversity(req.params.id, req.body);
        
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        res.json(university);
    } catch (error) {
        console.error('Error in PUT /universities/:id:', error);
        res.status(500).json({ error: 'Server error updating university' });
    }
});

// Delete university
router.delete('/:id', async (req, res) => {
    try {
        const university = await University.deleteUniversity(req.params.id);
        
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        res.json({ message: 'University deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /universities/:id:', error);
        res.status(500).json({ error: 'Server error deleting university' });
    }
});

// Add department to university
router.post('/:id/departments', async (req, res) => {
    try {
        const { name } = req.body;
        const department = await University.addDepartment(req.params.id, name);
        res.status(201).json(department);
    } catch (error) {
        console.error('Error in POST /universities/:id/departments:', error);
        res.status(500).json({ error: 'Server error adding department' });
    }
});

// Add course to university
router.post('/:id/courses', async (req, res) => {
    try {
        const { departmentId, ...courseData } = req.body;
        const course = await University.addCourse(req.params.id, departmentId, courseData);
        res.status(201).json(course);
    } catch (error) {
        console.error('Error in POST /universities/:id/courses:', error);
        res.status(500).json({ error: 'Server error adding course' });
    }
});

// Add resource to university
router.post('/:id/resources', async (req, res) => {
    try {
        const resource = await University.addResource(req.params.id, req.body);
        res.status(201).json(resource);
    } catch (error) {
        console.error('Error in POST /universities/:id/resources:', error);
        res.status(500).json({ error: 'Server error adding resource' });
    }
});

module.exports = router;