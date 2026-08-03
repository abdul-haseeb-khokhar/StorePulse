const {z} = require('zod');

const emailValidator = z.string().email('Invalid email address').toLowerCase();

const passwordValidator = z.string()
    .min(8, 'Password must be at least 8 characters')
    // bcrypt silently ignores anything past 72 bytes, so a longer password
    // gives false confidence and costs extra hashing time for nothing —
    // capping here avoids both.
    .max(50, 'Password must be at most 50 characters')
    .regex(/[A-Z]/, 'Password must contain atleast one uppercase letter')
    .regex(/[0-9]/, 'Password must conatain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const inviteAdminSchema = z.object({
    body: z.object({
        email: emailValidator,
    })
});

const acceptInviteSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token is required'),
        fullName: z.string().min(2, 'Full name must be atleast 2 characters').max(50, 'Full name too long'),
        password: passwordValidator,
    })
});

const adminLoginSchema = z.object({
    body: z.object({
        email: emailValidator,
        password: z.string().min(1, 'Password is required'),
    })
});

module.exports = {inviteAdminSchema, acceptInviteSchema, adminLoginSchema};
