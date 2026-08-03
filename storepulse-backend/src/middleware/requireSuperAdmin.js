const AppError = require('../utils/AppError');

function requireSuperAdmin(req, res, next) {
    if(req.admin.role !== 'SUPERADMIN') {
        return next(new AppError('Not permitted for this action', 403));
    }

    next();
}

module.exports = requireSuperAdmin;
