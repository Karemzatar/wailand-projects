const jwt = require('jsonwebtoken');
const rateLimitStore = new Map();

// Enhanced rate limiting with memory store
const advancedRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        if (rateLimitStore.has(key)) {
            const requests = rateLimitStore.get(key).filter(time => time > windowStart);
            rateLimitStore.set(key, requests);
        }
        
        // Check current requests
        const userRequests = rateLimitStore.get(key) || [];
        if (userRequests.length >= maxRequests) {
            return res.status(429).json({ 
                message: 'Too many requests, please try again later',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        // Add current request
        userRequests.push(now);
        rateLimitStore.set(key, userRequests);
        
        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - userRequests.length),
            'X-RateLimit-Reset': new Date(now + windowMs)
        });
        
        next();
    };
};

// Enhanced JWT verification with role checking
const verifyToken = (requiredRoles = []) => {
    return (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ 
                    message: 'Access denied. No token provided.',
                    code: 'NO_TOKEN'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
            
            // Check if user is still active (if we had user status)
            // This would require database lookup in production
            
            // Check role requirements
            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient permissions.',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: requiredRoles,
                    current: decoded.role
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            
            res.status(401).json({ 
                message: 'Invalid token.',
                code: 'INVALID_TOKEN'
            });
        }
    };
};

// Admin-only middleware
const requireAdmin = verifyToken(['admin']);

// User or admin middleware
const requireAuth = verifyToken(['admin', 'user']);

// Project access validation
const validateProjectAccess = async (req, res, next) => {
    try {
        const { projectCode } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Admin can access any project
        if (user.role === 'admin') {
            return next();
        }

        // For users, check if they have access to this project
        if (req.app.locals.mongoReady) {
            const User = require('../data/User');
            const userRecord = await User.findById(user.userId);
            
            const hasAccess = userRecord.projectAccess.some(
                access => access.projectCode === projectCode
            );

            if (!hasAccess) {
                return res.status(403).json({ 
                    message: 'Access denied. You do not have access to this project.',
                    code: 'PROJECT_ACCESS_DENIED'
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error during access validation' });
    }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.set('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    res.set('X-XSS-Protection', '1; mode=block');
    
    // HSTS (in production)
    if (process.env.NODE_ENV === 'production') {
        res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    res.set('Content-Security-Policy', "default-src 'self'");
    
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || 'Unknown';
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - User-Agent: ${userAgent}`);
    
    // Store in database in production
    if (process.env.NODE_ENV === 'production' && req.app.locals.mongoReady) {
        // This would log to a requests collection
        // For now, just console logging
    }
    
    next();
};

// Input sanitization enhancement
const advancedSanitization = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
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
    
    // Sanitize query parameters
    if (req.query) {
        req.query = sanitize(req.query);
    }
    
    next();
};

module.exports = {
    advancedRateLimit,
    verifyToken,
    requireAdmin,
    requireAuth,
    validateProjectAccess,
    securityHeaders,
    requestLogger,
    advancedSanitization
};
