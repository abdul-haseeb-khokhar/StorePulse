const {signUp, login, getUserById} = require('./auth.service')

async function signUpController(req, res, next) {
    try {
        const {fullName, email, password} = req.body;
        const result = await signUp({fullName, email, password});
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
}
async function loginController(req, res, next) {
    try {
        const {email, password} = req.body;
        const result = await login({email, password});
        res.status(200).json(result)
    }
    catch(error){
        next(error)
    }
}

async function meController(req, res, next) {
    try{
        const user = await getUserById(req.user.id)
        res.status(200).json({user});
    } catch(error){
        next(error)
    }
}

module.exports = {
    signUpController, loginController, meController
}