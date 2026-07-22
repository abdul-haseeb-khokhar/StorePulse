const {signUp, login, getUserById, changeName, changePassword, verifyEmail, resendVerification, requestEmailChange, confirmEmailChange} = require('./auth.service')

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

async function updateNameController(req, res, next) {
    try {
        console.log(req.body.fullName)
        const updated = await changeName(req.user.id, req.body.fullName);
        res.json({message: 'Name updated successfully'})
    } catch (err) {
        next(err);
    }
}

async function updatePasswordController(req, res, next) {
    try {
        await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
        res.json({message: 'Password updated successfully'});
    } catch (error) {
        next(error);
    }
}

async function verifyEmailController(req, res, next) {
    try {
        const {token} = req.query;
        const result = await verifyEmail(token);
        res.status(200).json(result)
    } catch(error) {
        next(error);
    }
}

async function resendVerificationController(req, res, next) {
    try {
        const { email } = req.body;
        const result = await resendVerification(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function requestEmailChangeController(req, res, next) {
    try{
        const {newEmail} = req.body;
        const result = await requestEmailChange(req.user.id, newEmail);
        res.status(200).json(result);
    }catch(error) {
        next(error);
    }
}

async function confirmEmailChangeController(req, res, next) {
    try {
        const {token} = req.query;
        const result = await confirmEmailChange(token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    signUpController, loginController, meController, updateNameController, updatePasswordController,
    verifyEmailController, resendVerificationController, requestEmailChangeController, confirmEmailChangeController
}