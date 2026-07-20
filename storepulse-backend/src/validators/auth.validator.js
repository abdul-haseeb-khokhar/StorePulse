const {z} = require('zod');
const registerSchema = z.object({
    body: z.object({
        fullName: z.string()
            .min(5, "Full name must be atleast 5 characters")
            .max(50, "Full name is too long"),
        email: z.string()
            .email("Invalid email address")
            .toLowerCase(),
        password: z.string()
            .min(8, "Password must be atleast 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
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

module.exports = {registerSchema, loginSchema}