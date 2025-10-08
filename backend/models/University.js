
// backend/models/University.js
const { pool } = require('../config/db');

class University {
    // Get all universities with pagination
    static async getAllUniversities(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT u.*, 
                   COUNT(DISTINCT d.id) as department_count, 
                   COUNT(DISTINCT c.id) as course_count
            FROM universities u
            LEFT JOIN departments d ON u.id = d.university_id
            LEFT JOIN courses c ON u.id = c.university_id
        `;
        
        const queryParams = [];
        let whereClause = [];
        
        // Apply filters if provided
        if (filters.name) {
            queryParams.push(`%${filters.name}%`);
            whereClause.push(`u.name ILIKE $${queryParams.length}`);
        }
        
        if (filters.location) {
            queryParams.push(`%${filters.location}%`);
            whereClause.push(`u.location ILIKE $${queryParams.length}`);
        }
        
        if (filters.rank) {
            queryParams.push(`%${filters.rank}%`);
            whereClause.push(`u.rank ILIKE $${queryParams.length}`);
        }
        
        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND ')}`;
        }
        
        query += ` GROUP BY u.id ORDER BY u.name LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);
        
        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) FROM universities`;
        if (whereClause.length > 0) {
            countQuery += ` WHERE ${whereClause.join(' AND ')}`;
        }
        
        try {
            const { rows } = await pool.query(query, queryParams);
            const countResult = await pool.query(countQuery, queryParams.slice(0, whereClause.length));
            const totalCount = parseInt(countResult.rows[0].count);
            
            return {
                universities: rows,
                pagination: {
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit),
                    current: page,
                    limit
                }
            };
        } catch (error) {
            console.error('Error fetching universities:', error);
            throw error;
        }
    }
    
    // Get university by ID with all related data
    static async getUniversityById(id) {
        try {
            // Get university details
            const universityQuery = 'SELECT * FROM universities WHERE id = $1';
            const universityResult = await pool.query(universityQuery, [id]);
            
            if (universityResult.rows.length === 0) {
                return null;
            }
            
            const university = universityResult.rows[0];
            
            // Get departments
            const departmentsQuery = 'SELECT * FROM departments WHERE university_id = $1 ORDER BY name';
            const departmentsResult = await pool.query(departmentsQuery, [id]);
            university.departments = departmentsResult.rows;
            
            // Get courses
            const coursesQuery = `
                SELECT c.*, d.name as department_name 
                FROM courses c
                LEFT JOIN departments d ON c.department_id = d.id
                WHERE c.university_id = $1
                ORDER BY d.name, c.name
            `;
            const coursesResult = await pool.query(coursesQuery, [id]);
            university.courses = coursesResult.rows;
            
            // Get resources
            const resourcesQuery = 'SELECT * FROM resources WHERE university_id = $1 ORDER BY type, name';
            const resourcesResult = await pool.query(resourcesQuery, [id]);
            university.resources = resourcesResult.rows;
            
            return university;
        } catch (error) {
            console.error('Error fetching university by ID:', error);
            throw error;
        }
    }
    
    // Create a new university
    static async createUniversity(universityData) {
        const { name, location, rank, established, overview, logo, website, email, phone } = universityData;
        
        try {
            const query = `
                INSERT INTO universities 
                (name, location, rank, established, overview, logo, website, email, phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            
            const values = [name, location, rank, established, overview, logo, website, email, phone];
            const { rows } = await pool.query(query, values);
            
            return rows[0];
        } catch (error) {
            console.error('Error creating university:', error);
            throw error;
        }
    }
    
    // Update university
    static async updateUniversity(id, universityData) {
        const { name, location, rank, established, overview, logo, website, email, phone } = universityData;
        
        try {
            const query = `
                UPDATE universities
                SET name = $1, location = $2, rank = $3, established = $4, 
                    overview = $5, logo = $6, website = $7, email = $8, phone = $9,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $10
                RETURNING *
            `;
            
            const values = [name, location, rank, established, overview, logo, website, email, phone, id];
            const { rows } = await pool.query(query, values);
            
            return rows[0];
        } catch (error) {
            console.error('Error updating university:', error);
            throw error;
        }
    }
    
    // Delete university
    static async deleteUniversity(id) {
        try {
            // This will cascade delete related departments, courses, and resources
            const query = 'DELETE FROM universities WHERE id = $1 RETURNING *';
            const { rows } = await pool.query(query, [id]);
            
            return rows[0];
        } catch (error) {
            console.error('Error deleting university:', error);
            throw error;
        }
    }
    
    // Add department to university
    static async addDepartment(universityId, departmentName) {
        try {
            const query = `
                INSERT INTO departments (university_id, name)
                VALUES ($1, $2)
                RETURNING *
            `;
            
            const { rows } = await pool.query(query, [universityId, departmentName]);
            return rows[0];
        } catch (error) {
            console.error('Error adding department:', error);
            throw error;
        }
    }
    
    // Add course to university
    static async addCourse(universityId, departmentId, courseData) {
        const { name, description, duration, level } = courseData;
        
        try {
            const query = `
                INSERT INTO courses (university_id, department_id, name, description, duration, level)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const values = [universityId, departmentId, name, description, duration, level];
            const { rows } = await pool.query(query, values);
            
            return rows[0];
        } catch (error) {
            console.error('Error adding course:', error);
            throw error;
        }
    }
    
    // Add resource to university
    static async addResource(universityId, resourceData) {
        const { name, type, author, year, size, duration, url } = resourceData;
        
        try {
            const query = `
                INSERT INTO resources (university_id, name, type, author, year, size, duration, url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            
            const values = [universityId, name, type, author, year, size, duration, url];
            const { rows } = await pool.query(query, values);
            
            return rows[0];
        } catch (error) {
            console.error('Error adding resource:', error);
            throw error;
        }
    }
}

module.exports = University;