const {findUserByEmail, createUser, findUserById} = require('./auth.repository')
const {hashPassword, comparePassword} = require('../../utils/passwordHashing')
const {signToken} = require('../../utils/jwt')
const { error } = require('node:console')
const AppError = require('../../utils/AppError')

async function signUp(fullName, email, password) {
    console.log("SignUP service is runnig")
    const existingUser = await findUserByEmail(email)
    if(existingUser){
        throw new AppError('An account with this email already exists', 409)
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(fullName, email, hashedPassword)

    const token = signToken({userId : user.id});

    return{
        user: {id: user.id, fullName: user.fullName, email: user.email},
        token,
    };
}

async function login(email, password) {
    console.log('Login service is called')
    const user = await findUserByEmail(email);
    if(!user) {
        throw new AppError("User doesn't exist", 401)
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if(!isPasswordValid){
        throw new AppError('Invalid password.', 401);
    }

    const token = signToken({userId: user.id})
    return {
        user: {id: user.id, fullName: user.fullName, email: user.email},
        token
    }
}

async function getUserById(id) {
    console.log('getuserbyid service is called')
    const user = await findUserById(id);
    if(!user){
        throw new AppError("User not found", 404);
    }

    return {id: user.id, fullName: user.fullName, email: user.email}
}

module.exports= {
    signUp, login, getUserById
}