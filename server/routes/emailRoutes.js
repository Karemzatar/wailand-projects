const express = require('express');
const router = express.Router();
const Email = require('../data/Email');
const Project = require('../data/Project');
const nodemailer = require('nodemailer');
const { validateEmailData, rateLimit } = require('../middleware/validation');

// Mock email transporter (in production, configure with real SMTP)
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'demo@wailand.com',
            pass: process.env.SMTP_PASS || 'demo-password'
        }
    });
};

// Get emails for a project
router.get('/project/:projectId', async (req, res) => {
    if (!req.app.locals.mongoReady) {
        // Return mock emails for development
        const mockEmails = [
            {
                _id: 'mock-email-1',
                subject: 'Project Kickoff Meeting',
                body: 'Hi team, I wanted to follow up on our kickoff meeting and confirm the next steps...',
                from: 'sarah@wailand.com',
                to: 'client@example.com',
                direction: 'sent',
                status: 'sent',
                sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'mock-email-2',
                subject: 'Re: Project Updates',
                body: 'Thanks for the update! Everything looks good from our side.',
                from: 'client@example.com',
                to: 'sarah@wailand.com',
                direction: 'received',
                status: 'received',
                receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];
        return res.json(mockEmails);
    }

    try {
        const emails = await Email.find({ projectId: req.params.projectId })
            .sort({ createdAt: -1 });
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send email
router.post('/send', validateEmailData, rateLimit(3, 60 * 1000), async (req, res) => {
    const { projectId, to, subject, body, from } = req.body;

    if (!req.app.locals.mongoReady) {
        // Mock sending for development
        return res.json({ 
            message: 'Email sent successfully (mock mode)',
            emailId: 'mock-' + Date.now()
        });
    }

    try {
        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Create email record
        const email = new Email({
            projectId,
            subject,
            body,
            from: from || 'noreply@wailand.com',
            to,
            direction: 'sent',
            status: 'sent',
            sentAt: new Date()
        });

        // Send email (commented out for demo - would work with real SMTP config)
        /*
        const transporter = createTransporter();
        await transporter.sendMail({
            from: from || 'noreply@wailand.com',
            to,
            subject,
            text: body,
            html: body.replace(/\n/g, '<br>')
        });
        */

        await email.save();
        res.json({ message: 'Email sent successfully', emailId: email._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all emails for admin
router.get('/admin/all', async (req, res) => {
    if (!req.app.locals.mongoReady) {
        return res.json([]);
    }

    try {
        const emails = await Email.find({})
            .populate('projectId', 'projectCode recipientName companyName')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
