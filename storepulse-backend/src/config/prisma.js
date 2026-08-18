/**
 * Shared Prisma client, built on the raw `pg` driver adapter instead of
 * Prisma's default connection engine. Imported everywhere a repository
 * needs the database so the whole app shares one connection pool.
 */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });
module.exports = prisma;
