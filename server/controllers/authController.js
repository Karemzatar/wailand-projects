const jwt = require('jsonwebtoken');
const User = require('../data/User');
const Project = require('../data/Project');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'fallback-secret-change-in-production',
        { expiresIn: '7d' }
    );
};

// Enhanced login with email identity
const loginWithProjectCode = async (req, res) => {
    try {
        const { code, email } = req.body;

        // Handle admin login
        if (code === process.env.ADMIN_CODE || 'wailandadmin') {
            // For admin, require email verification
            if (!email) {
                return res.status(400).json({ 
                    message: 'Admin access requires email verification',
                    requiresEmail: true 
                });
            }

            // Check if admin user exists or create one
            let adminUser = await User.findOne({ email, role: 'admin' });
            if (!adminUser) {
                adminUser = new User({
                    email,
                    name: 'System Administrator',
                    role: 'admin'
                });
                await adminUser.save();
            }

            adminUser.lastLogin = new Date();
            await adminUser.save();

            return res.json({
                role: 'admin',
                user: adminUser.toSafeObject(),
                token: generateToken(adminUser._id, 'admin')
            });
        }

        // Handle project code login
        if (!code || code.length !== 16) {
            return res.status(400).json({ message: 'Invalid project code format' });
        }

        // Find project
        let project;
        if (req.app.locals.mongoReady) {
            project = await Project.findOne({ projectCode: code });
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Check expiry
            if (new Date(project.expiryDate) < new Date()) {
                return res.status(403).json({ message: 'Project code expired' });
            }
        } else {
            // Mock project for development
            const { makeMockProjectFromCode } = require('../data/mockData');
            project = makeMockProjectFromCode(code);
        }

        // For project access, email is optional but recommended
        let user = null;
        if (email) {
            // Find or create user
            user = await User.findOne({ email });
            if (!user) {
                user = new User({
                    email,
                    name: email.split('@')[0], // Extract name from email
                    role: 'user'
                });
            }

            // Update project access
            const existingAccess = user.projectAccess.find(
                access => access.projectCode === code
            );

            if (!existingAccess) {
                user.projectAccess.push({
                    projectId: project._id || 'mock-id',
                    projectCode: code,
                    accessDate: new Date()
                });
            }

            // Update last accessed
            const accessIndex = user.projectAccess.findIndex(
                access => access.projectCode === code
            );
            if (accessIndex !== -1) {
                user.projectAccess[accessIndex].lastAccessed = new Date();
            }

            user.lastLogin = new Date();
            await user.save();
        }

        return res.json({
            role: 'user',
            project,
            user: user ? user.toSafeObject() : null,
            token: user ? generateToken(user._id, 'user') : null,
            requiresEmail: !user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Verify JWT token
const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get current user info
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout (client-side mainly, but we can track it)
const logout = async (req, res) => {
    try {
        // Update last logout time if user exists
        if (req.user?.userId) {
            await User.findByIdAndUpdate(req.user.userId, {
                lastLogout: new Date()
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};

module.exports = {
    loginWithProjectCode,
    verifyToken,
    getCurrentUser,
    logout,
    generateToken
};
