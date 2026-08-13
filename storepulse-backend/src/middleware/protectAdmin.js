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

        // A validly-signed token with the wrong shape — a regular user
        // token presented here, say — decodes fine but has no adminId.
        // Passing that straight to findAdminById(undefined) reaches Prisma
        // as `where: {id: undefined}`, which throws a PrismaClientValidationError
        // (not an AppError) and falls through to a raw 500. Same session
        // problem as a missing/expired token, so it gets the same 401.
        if (!decoded.adminId) {
            throw new AppError("Invalid or expired session. Please login again.", 401);
        }

        const admin = await findAdminById(decoded.adminId);

        if(!admin) {
            throw new AppError('Admin not found', 404);
        }
        if(!admin.isActive) {
            throw new AppError('Your admin access has been deactivated.', 403);
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
