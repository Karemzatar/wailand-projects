const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    direction: { type: String, enum: ['sent', 'received'], required: true },
    messageId: { type: String }, // For IMAP tracking
    threadId: { type: String },
    status: { 
        type: String, 
        enum: ['draft', 'sent', 'delivered', 'failed', 'received'], 
        default: 'draft' 
    },
    sentAt: { type: Date },
    receivedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', EmailSchema);
