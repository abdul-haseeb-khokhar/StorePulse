require('dotenv').config();
const prisma = require('../src/config/prisma');
const {hashPassword} = require('../src/utils/passwordHashing');

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_NAME || 'Super Admin';

    if(!email || !password) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding');
    }

    const existing = await prisma.admin.findUnique({where: {email}});
    if(existing) {
        console.log(`Admin ${email} already exists, skipping seed.`);
        return;
    }

    const hashedPassword = await hashPassword(password);
    await prisma.admin.create({
        data: {
            email,
            fullName,
            password: hashedPassword,
            role: 'SUPERADMIN',
            isActive: true,
        }
    });

    console.log(`Superadmin ${email} created.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
