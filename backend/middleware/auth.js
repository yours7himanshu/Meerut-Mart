import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    // Check both standard authorization header and legacy 'token' header
    const authHeader = req.headers['authorization'] || req.headers['token'];

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization token missing or invalid. Please log in again.' });
    }

    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification failed:', error);
        res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
};

export default authUser;
