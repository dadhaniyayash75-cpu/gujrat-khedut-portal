const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }
    
    try {
        if (token.startsWith('Bearer ')) token = token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_for_khedut_portal');
        
        // Fetch fresh user from DB
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User account no longer exists' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ 
                success: false, 
                message: 'તમારું એકાઉન્ટ એડમિનિસ્ટ્રેટર દ્વારા બ્લોક કરવામાં આવ્યું છે. (Your account has been suspended by the administrator).' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user?.role || 'guest'}' is not authorized to access this resource` 
            });
        }
        next();
    };
};

exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied: Website Owner / Admin authorization required' 
        });
    }
    next();
};