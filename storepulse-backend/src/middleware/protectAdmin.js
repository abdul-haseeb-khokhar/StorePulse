const {verifyToken} = require('../utils/jwt');
const AppError = require('../utils/AppError');
const {findAdminById} = require('../modules/adminAuth/adminAuth.repository');

async function protectAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new AppError("You are not logged in. Please log in to continue.", 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        const admin = await findAdminById(decoded.adminId);

        if(!admin) {
            throw new AppError('Admin not found', 404);
        }

        req.admin = {id: admin.id, role: admin.role};

        next()
    } catch (error) {
        if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'){
            return next(new AppError("Invalid or expired session. Please login again.", 401));
        }

        next(error)
    }
}

module.exports = protectAdmin;
