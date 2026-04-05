const express = require('express');
const router = express.Router();
const Project = require('../data/Project');
const { makeMockProjectFromCode } = require('../data/mockData');
const { validateProjectCode, validateProjectData, rateLimit } = require('../middleware/validation');

// Generate 16-character secure code
const generateProjectCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let code = '';
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Login via Project Code
router.post('/login', validateProjectCode, rateLimit(10, 15 * 60 * 1000), async (req, res) => {
    const { code } = req.body;
    if (code === 'wailandadmin') {
        return res.json({ role: 'admin' });
    }

    // If MongoDB isn't connected (dev environment), fall back to mock project data.
    if (!req.app.locals.mongoReady) {
        const trimmed = String(code || '');
        if (trimmed.length !== 16) {
            return res.status(404).json({ message: 'Invalid project code' });
        }
        return res.json({
            role: 'user',
            project: makeMockProjectFromCode(trimmed),
        });
    }
    
    try {
        const project = await Project.findOne({ projectCode: code });
        if (project) {
            // Check expiry
            if (new Date(project.expiryDate) < new Date()) {
                return res.status(403).json({ message: 'Project code expired' });
            }
            res.json({ role: 'user', project });
        } else {
            res.status(404).json({ message: 'Invalid project code' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin creates a project
router.post('/', validateProjectData, rateLimit(5, 60 * 1000), async (req, res) => {
    try {
        const newProject = new Project({
            ...req.body,
            projectCode: generateProjectCode()
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a note to a project
router.post('/:id/notes', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        project.notes.push(req.body);
        project.activityLog.push({ action: `Note added by ${req.body.author}` });
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
