// Generate 16-character secure project code
const generateProjectCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let code = '';
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Validate project code format
const validateProjectCode = (code) => {
    if (!code || typeof code !== 'string') {
        return false;
    }
    
    // Check length
    if (code.length !== 16) {
        return false;
    }
    
    // Check character set (allow alphanumerics and special chars)
    const validChars = /^[A-Za-z0-9!@#$%^&*]+$/;
    return validChars.test(code);
};

// Format date for display
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
};

// Format relative time
const formatRelativeTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - d;
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return formatDate(date);
};

// Sanitize and validate email
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { valid: false, message: 'Invalid email format' };
    }
    
    return { valid: true, email: email.trim().toLowerCase() };
};

// Generate unique identifier
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Pagination helper
const getPagination = (page, limit) => {
    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;
    
    return {
        currentPage,
        perPage,
        skip,
        totalPages: Math.ceil(100 / perPage) // This would be calculated from total count
    };
};

module.exports = {
    generateProjectCode,
    validateProjectCode,
    formatDate,
    formatRelativeTime,
    validateEmail,
    generateId,
    getPagination
};
