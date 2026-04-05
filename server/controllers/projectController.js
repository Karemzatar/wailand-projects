const Project = require('../data/Project');
const User = require('../data/User');
const { generateProjectCode } = require('../utils/projectUtils');

// Get all projects for admin
const getAllProjects = async (req, res) => {
    try {
        if (!req.app.locals.mongoReady) {
            const { makeMockAdminProjects } = require('../data/mockData');
            return res.json(makeMockAdminProjects());
        }

        const projects = await Project.find()
            .sort({ createdAt: -1 })
            .select('-activityLog -notes'); // Exclude large fields for list view
        
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
};

// Get project by ID with full details
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.app.locals.mongoReady) {
            const { makeMockProjectFromCode } = require('../data/mockData');
            const mockProject = makeMockProjectFromCode('A1b2C3d4E5f6G7h8');
            return res.json(mockProject);
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Log access if user is authenticated
        if (req.user) {
            await project.addActivity(
                'project_accessed',
                `Project accessed by ${req.user.userId}`,
                req.user.email || 'unknown',
                req.user.name || 'Unknown User',
                'login'
            );
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch project', error: error.message });
    }
};

// Create new project
const createProject = async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            projectCode: generateProjectCode()
        };

        if (!req.app.locals.mongoReady) {
            // Return mock project for development
            const { makeMockProjectFromCode } = require('../data/mockData');
            const mockProject = makeMockProjectFromCode(projectData.projectCode);
            Object.assign(mockProject, projectData);
            return res.status(201).json(mockProject);
        }

        const project = new Project(projectData);
        await project.save();

        // Add initial activity
        await project.addActivity(
            'project_created',
            'Project created successfully',
            req.user?.email || 'system',
            req.user?.name || 'System',
            'system',
            { createdBy: req.user?.userId }
        );

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project', error: error.message });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!req.app.locals.mongoReady) {
            return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Track what changed
        const changedFields = [];
        Object.keys(updates).forEach(key => {
            if (project[key] !== updates[key]) {
                changedFields.push(key);
            }
        });

        Object.assign(project, updates);
        project.updatedAt = new Date();
        await project.save();

        // Log update activity
        if (changedFields.length > 0) {
            await project.addActivity(
                'project_updated',
                `Project updated: ${changedFields.join(', ')}`,
                req.user?.email || 'system',
                req.user?.name || 'System',
                'project_updated',
                { changedFields, updatedBy: req.user?.userId }
            );
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update project', error: error.message });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.app.locals.mongoReady) {
            return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Project.findByIdAndDelete(id);

        res.json({ 
            message: 'Project deleted successfully',
            deletedProject: project
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete project', error: error.message });
    }
};

// Add note to project
const addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, type = 'note' } = req.body;

        if (!req.app.locals.mongoReady) {
            return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const note = {
            content,
            author: req.user?.name || 'Anonymous',
            authorEmail: req.user?.email || 'anonymous@example.com',
            type,
            date: new Date()
        };

        project.notes.push(note);
        await project.save();

        // Log note activity
        await project.addActivity(
            'note_added',
            `Note added by ${req.user?.name || 'Anonymous'}`,
            req.user?.email || 'anonymous@example.com',
            req.user?.name || 'Anonymous',
            'note_added',
            { noteId: project.notes.length - 1 }
        );

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add note', error: error.message });
    }
};

// Add member to project
const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userEmail, userName, role = 'member' } = req.body;

        if (!req.app.locals.mongoReady) {
            return res.status(501).json({ error: 'MongoDB not connected (dev mock mode)' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.addMember(userEmail, userName, role);

        // Log member addition
        await project.addActivity(
            'user_joined',
            `${userName} (${userEmail}) joined the project`,
            userEmail,
            userName,
            'user_joined',
            { role, addedBy: req.user?.userId }
        );

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add member', error: error.message });
    }
};

// Get project activity log
const getActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, type } = req.query;

        if (!req.app.locals.mongoReady) {
            const { makeMockProjectFromCode } = require('../data/mockData');
            const mockProject = makeMockProjectFromCode('A1b2C3d4E5f6G7h8');
            return res.json(mockProject.activityLog || []);
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        let activityLog = project.activityLog || [];
        
        // Filter by type if specified
        if (type) {
            activityLog = activityLog.filter(activity => activity.type === type);
        }

        // Sort by date (newest first) and limit
        activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
        activityLog = activityLog.slice(0, parseInt(limit));

        res.json(activityLog);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch activity log', error: error.message });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addNote,
    addMember,
    getActivityLog
};
