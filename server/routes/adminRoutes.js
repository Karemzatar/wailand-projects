const express = require('express');
const router = express.Router();
const Project = require('../data/Project');
const { makeMockAdminProjects } = require('../data/mockData');

// Get all projects for admin
router.get('/projects', async (req, res) => {
    if (!req.app.locals.mongoReady) {
        return res.json(makeMockAdminProjects());
    }

    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
    if (!req.app.locals.mongoReady) {
        return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
    }

    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update project
router.put('/projects/:id', async (req, res) => {
    if (!req.app.locals.mongoReady) {
        return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
    }

    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
