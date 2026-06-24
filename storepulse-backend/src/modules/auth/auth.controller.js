const {signUp, login, getUserById} = require('./auth.service')

async function signUpController(req, res, next) {
    console.log("signUpcontorller is running")
    try {
        const {fullName, email, password} = req.body;
        const result = await signUp(fullName, email, password);
        console.log(result)
        res.status(201).json(result)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
async function loginController(req, res, next) {
    console.log('Login controller is called')
    try {
        const {email, password} = req.body;
        const result = await login(email, password);
        console.log(result)
        res.status(200).json(result)
    }
    catch(error){
        console.error(error)
        next(error)
    }
}

async function meController(req, res, next) {
    console.log('Me controller is called')
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