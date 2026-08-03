const {updateUserStatus, listUsers, findUserByIdWithSites, listSites, getPlatformStats, createAdminLog} = require('./admin.repository');
const {findUserById} = require('../auth/auth.repository')
const AppError = require('../../utils/AppError');

async function updateUserStatusService(userId, status, adminId) {
    const user = await findUserById(userId)

    if(!user) {
        throw new AppError('User not found', 404);
    }

    if(user.status === 'Deleted') {
        throw new AppError("This is a deleted user and can't be modified",401);
    }

    let result;
    if(user.status !== 'Active' && status === 'Active'){
        if(!user.isEmailVerified) {
            throw new AppError('User email is not verified yet', 400);
        }
        const updatedUser = await updateUserStatus(userId, {status});
        result = {updatedUser, message : 'User status is activated now'};
    } else if(user.status !== 'Banned' && status === 'Banned'){
        const updatedUser = await updateUserStatus(userId, {status});
        result = {updatedUser, message : 'User is banned now'};
    } else if(status === 'Deleted') {
        const updatedUser = await updateUserStatus(userId, {status, email: `deleted-${userId}-@storepulse.invalid`});
        result = {updatedUser, message : 'User is deleted now'};
    } else {
        throw new AppError("Changing to same status is not allowed", 400);
    }

    await createAdminLog({adminId, action: `status:${status}`, targetedUserId: userId});
    return result;
}

async function listUsersService({page, limit, search, status}) {
    const skip = (page - 1) * limit;
    const {users, total} = await listUsers({skip, take: limit, search, status});

    return {users, total, page, limit, totalPages: Math.ceil(total / limit)};
}

async function getUserDetailService(userId) {
    const user = await findUserByIdWithSites(userId);
    if(!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

async function listSitesService({page, limit, search}) {
    const skip = (page - 1) * limit;
    const {sites, total} = await listSites({skip, take: limit, search});

    return {sites, total, page, limit, totalPages: Math.ceil(total / limit)};
}

module.exports = {updateUserStatusService, listUsersService, getUserDetailService, listSitesService, getPlatformStats}
