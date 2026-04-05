const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    content: String,
    author: String,
    authorEmail: String,
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['note', 'status', 'email', 'system'], default: 'note' }
});

const ActivityLogSchema = new mongoose.Schema({
    action: String,
    description: String,
    userEmail: String,
    userName: String,
    type: { type: String, enum: ['login', 'logout', 'note_added', 'project_updated', 'email_sent', 'user_joined'], default: 'system' },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Flexible metadata for different activity types
    date: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
    projectCode: { type: String, required: true, unique: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    companyName: { type: String },
    phoneNumber: { type: String },
    projectSupervisor: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Active', 'Completed', 'On Hold', 'Cancelled'], 
        default: 'Active' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    budget: { type: Number },
    tags: [String],
    notes: [NoteSchema],
    activityLog: [ActivityLogSchema],
    members: [{
        userEmail: { type: String, required: true },
        userName: { type: String, required: true },
        role: { type: String, enum: ['owner', 'member', 'viewer'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
        lastAccessed: { type: Date },
        isActive: { type: Boolean, default: true }
    }],
    settings: {
        allowGuestAccess: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true },
        requireApprovalForNotes: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
ProjectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to add activity log
ProjectSchema.methods.addActivity = function(action, description, userEmail, userName, type = 'system', metadata = {}) {
    this.activityLog.push({
        action,
        description,
        userEmail,
        userName,
        type,
        metadata
    });
    return this.save();
};

// Method to add member
ProjectSchema.methods.addMember = function(userEmail, userName, role = 'member') {
    // Check if member already exists
    const existingMember = this.members.find(member => member.userEmail === userEmail);
    if (existingMember) {
        existingMember.lastAccessed = new Date();
        existingMember.isActive = true;
    } else {
        this.members.push({
            userEmail,
            userName,
            role,
            joinedAt: new Date()
        });
    }
    return this.save();
};

module.exports = mongoose.model('Project', ProjectSchema);
