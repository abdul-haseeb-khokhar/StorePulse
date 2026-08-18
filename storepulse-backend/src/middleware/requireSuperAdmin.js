/**
 * Extra permission gate layered on top of protectAdmin, for routes only a
 * SUPERADMIN may use.
 */
const AppError = require('../utils/AppError');

/**
 * Express middleware. Must run after protectAdmin (needs `req.admin.role`).
 */
function requireSuperAdmin(req, res, next) {
    if(req.admin.role !== 'SUPERADMIN') {
        return next(new AppError('Not permitted for this action', 403));
    }

    next();
}

module.exports = requireSuperAdmin;
