/**
 * Zod request schemas for the regular user auth module: register/login,
 * profile changes, and the email verification / password reset flows.
 */
const {z} = require('zod');

const fullNameValidator = z.string()
    .min(2, "Full name must be atleast 2 characters")
    .max(50, 'Full name too long');

const emailValidator = z.string()
    .email('Invalid email address')
    .toLowerCase();

const passwordValidator = z.string()
    .min(8, 'Password must be at least 8 characters')
    // bcrypt silently ignores anything past 72 bytes, so a longer password
    // gives false confidence and costs extra hashing time for nothing —
    // capping here avoids both.
    .max(50, 'Password must be at most 50 characters')
    .regex(/[A-Z]/, 'Password must contain atleast one uppercase letter')
    .regex(/[0-9]/, 'Password must conatain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
    body: z.object({
        fullName: fullNameValidator,
        email: emailValidator,
        password: passwordValidator
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: emailValidator,
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
        currentPassword: z.string().min(1, "Missing current password"),
        newPassword: passwordValidator
    })
})

const resendVerificationSchema = z.object({
    body: z.object({
        email: emailValidator
    })
})

const requestEmailChangeSchema = z.object({
    body: z.object({
        newEmail: emailValidator
    })
})

const forgotPasswordSchema = z.object({
    body: z.object({
        email: emailValidator
    })
})

const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token is required'),
        newPassword: passwordValidator
    })
})

const verifyEmailSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Token is required')
    })
})

const confirmEmailChangeSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Token is required')
    })
})


module.exports = {registerSchema, loginSchema, changeNameSchema, changePasswordSchema,
    resendVerificationSchema, requestEmailChangeSchema, forgotPasswordSchema, resetPasswordSchema,
    verifyEmailSchema, confirmEmailChangeSchema
}
