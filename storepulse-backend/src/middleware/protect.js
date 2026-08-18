const {verifyToken} = require('../utils/jwt');
const AppError = require('../utils/AppError');
const {findUserById} = require('../modules/auth/auth.repository');

async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new AppError("You are not logged in. Please log in to continue.", 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        // A validly-signed token with the wrong shape — an admin token
        // presented here, say — decodes fine but has no userId. Passing
        // that straight to findUserById(undefined) reaches Prisma as
        // `where: {id: undefined}`, which throws a PrismaClientValidationError
        // (not an AppError) and falls through to a raw 500. Same session
        // problem as a missing/expired token, so it gets the same 401.
        if (!decoded.userId) {
            throw new AppError("Invalid or expired session. Please login again.", 401);
        }

        const user = await findUserById(decoded.userId);
        
        if(!user) {
            throw new AppError('User not found', 404);
        }
        if(user.status !== 'Active') {
            throw new AppError(user.status === 'Banned' ? 'User is banned by admin.' : "This user doesn't exist",user.status === 'Banned' ? 403 : 404);
        }

        req.user = {id: decoded.userId};

        next()
    } catch (error) {
        if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'){
            return next(new AppError("Invalid or expired session. Please login again.", 401));
        }

        next(error)
    }
}

module.exports = protect;
