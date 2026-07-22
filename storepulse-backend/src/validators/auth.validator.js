const {z} = require('zod');

const fullNameValidator = z.string()
    .min(2, "Full name must be atleast 2 characters")
    .max(50, 'Full name too long');

const passwordValidator = z.string()
    .min(8, 'Password must be atleast 8 characters')
    .regex(/[A-Z]/, 'Password must contain atleast one uppercase letter')
    .regex(/[0-9]/, 'Password must conatain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
    body: z.object({
        fullName: fullNameValidator,
        email: z.string()
            .email("Invalid email address")
            .toLowerCase(),
        password: passwordValidator
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string()
            .email("Invalid email address")
            .toLowerCase(),
        password: z.string()
            .min(1, 'Password is required')
    })
})

const changeNameSchema = z.object({
    body: z.object({
        fullName: fullNameValidator
    })
})

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string(1, "Missing current password"),
        newPassword: passwordValidator
    })
})
module.exports = {registerSchema, loginSchema, changeNameSchema, changePasswordSchema}