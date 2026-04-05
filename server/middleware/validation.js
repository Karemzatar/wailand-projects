// Security and validation middleware

const validateProjectCode = (req, res, next) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ message: 'Project code is required' });
    }
    
    // Check if it's the admin code
    if (code === 'wailandadmin') {
        return next();
    }
    
    // Validate project code format (16 characters, alphanumeric + special chars)
    if (typeof code !== 'string' || code.length !== 16) {
        return res.status(400).json({ message: 'Invalid project code format' });
    }
    
    // Sanitize input
    req.body.code = code.trim();
    next();
};

const validateProjectData = (req, res, next) => {
    const { recipientName, recipientEmail, projectSupervisor, expiryDate } = req.body;
    
    const errors = [];
    
    if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length < 2) {
        errors.push('Valid recipient name is required (min 2 characters)');
    }
    
    if (!recipientEmail || typeof recipientEmail !== 'string') {
        errors.push('Valid recipient email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail.trim())) {
            errors.push('Invalid email format');
        }
    }
    
    if (!projectSupervisor || typeof projectSupervisor !== 'string' || projectSupervisor.trim().length < 2) {
        errors.push('Valid project supervisor name is required (min 2 characters)');
    }
    
    if (!expiryDate) {
        errors.push('Expiry date is required');
    } else {
        const expiry = new Date(expiryDate);
        if (isNaN(expiry.getTime()) || expiry <= new Date()) {
            errors.push('Expiry date must be in the future');
        }
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Sanitize inputs
    req.body.recipientName = recipientName.trim();
    req.body.recipientEmail = recipientEmail.trim();
    req.body.projectSupervisor = projectSupervisor.trim();
    req.body.companyName = req.body.companyName ? req.body.companyName.trim() : '';
    req.body.phoneNumber = req.body.phoneNumber ? req.body.phoneNumber.trim() : '';
    
    next();
};

const validateEmailData = (req, res, next) => {
    const { to, subject, body, projectId } = req.body;
    
    const errors = [];
    
    if (!to || typeof to !== 'string') {
        errors.push('Valid recipient email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to.trim())) {
            errors.push('Invalid email format');
        }
    }
    
    if (!subject || typeof subject !== 'string' || subject.trim().length < 1) {
        errors.push('Subject is required');
    }
    
    if (!body || typeof body !== 'string' || body.trim().length < 1) {
        errors.push('Message body is required');
    }
    
    if (!projectId) {
        errors.push('Project ID is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Sanitize inputs
    req.body.to = to.trim();
    req.body.subject = subject.trim();
    req.body.body = body.trim();
    
    next();
};

// Rate limiting middleware (simple in-memory implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        if (requests.has(key)) {
            const userRequests = requests.get(key).filter(time => time > windowStart);
            requests.set(key, userRequests);
        }
        
        // Check current requests
        const userRequests = requests.get(key) || [];
        if (userRequests.length >= maxRequests) {
            return res.status(429).json({ message: 'Too many requests, please try again later' });
        }
        
        // Add current request
        userRequests.push(now);
        requests.set(key, userRequests);
        
        next();
    };
};

// XSS protection middleware
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };
    
    // Sanitize request body
    if (req.body) {
        req.body = sanitize(req.body);
    }
    
    next();
};

module.exports = {
    validateProjectCode,
    validateProjectData,
    validateEmailData,
    rateLimit,
    sanitizeInput
};
