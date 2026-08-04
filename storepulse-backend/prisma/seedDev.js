// Populates local dev/test data: demo users, sites, and analytics events.
// Safe to re-run — it clears out only the data it previously created
// (identified by the @storepulse.test email domain) before reseeding.
require('dotenv').config();
const crypto = require('crypto');
const prisma = require('../src/config/prisma');
const { hashPassword } = require('../src/utils/passwordHashing');
const { generateApiKey } = require('../src/utils/apiKey');

const DEMO_DOMAIN = 'storepulse.test';
const DEMO_PASSWORD = 'Password123!';

const USERS = [
    { fullName: 'Ayesha Raza', status: 'Active', isEmailVerified: true, siteCount: 2 },
    { fullName: 'Bilal Ahmed', status: 'Active', isEmailVerified: true, siteCount: 1 },
    { fullName: 'Farah Siddiqui', status: 'Active', isEmailVerified: true, siteCount: 2 },
    { fullName: 'Hamza Tariq', status: 'Inactive', isEmailVerified: false, siteCount: 0 },
    { fullName: 'Sana Malik', status: 'Banned', isEmailVerified: true, siteCount: 1 },
];

const SITES_CATALOG = [
    { name: 'Aurora Home Goods', domain: 'aurorahome.example.com' },
    { name: 'Kicks & Co', domain: 'kicksandco.example.com' },
    { name: 'Bloom Botanicals', domain: 'bloombotanicals.example.com' },
    { name: 'Circuit Supply', domain: 'circuitsupply.example.com' },
    { name: 'Nomad Outfitters', domain: 'nomadoutfitters.example.com' },
    { name: 'Pixel & Thread', domain: 'pixelandthread.example.com' },
];

const PRODUCTS = [
    { id: 'prod-wireless-earbuds-pro', name: 'Wireless Earbuds Pro' },
    { id: 'prod-classic-leather-wallet', name: 'Classic Leather Wallet' },
    { id: 'prod-ceramic-coffee-mug', name: 'Ceramic Coffee Mug' },
    { id: 'prod-running-shoes-x1', name: 'Running Shoes X1' },
    { id: 'prod-organic-cotton-tote', name: 'Organic Cotton Tote' },
    { id: 'prod-smart-watch-lite', name: 'Smart Watch Lite' },
    { id: 'prod-yoga-mat-pro', name: 'Yoga Mat Pro' },
    { id: 'prod-desk-lamp-mini', name: 'Desk Lamp Mini' },
];

const PAGE_PATHS = ['/', '/products', '/about', '/cart', '/checkout', '/blog/summer-sale'];

const REFERRERS = [
    null,
    null,
    'https://www.google.com/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://www.instagram.com/',
    'https://www.bing.com/',
    'https://news.ycombinator.com/',
];

const EXTRA_ADMINS = [
    { fullName: 'Demo Admin', status: 'active', role: 'ADMIN' },
    { fullName: 'Pending Admin', status: 'invited', role: 'ADMIN' },
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
    return list[randomInt(0, list.length - 1)];
}

function randomDateWithinLastNDays(days) {
    const now = Date.now();
    const offsetMs = randomInt(0, days * 24 * 60 * 60 * 1000);
    return new Date(now - offsetMs);
}

async function clearPreviousDemoData() {
    const demoUsers = await prisma.user.findMany({
        where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
        select: { id: true },
    });
    const demoUserIds = demoUsers.map((u) => u.id);

    if (demoUserIds.length > 0) {
        const demoSites = await prisma.site.findMany({
            where: { userId: { in: demoUserIds } },
            select: { id: true },
        });
        const demoSiteIds = demoSites.map((s) => s.id);

        if (demoSiteIds.length > 0) {
            await prisma.event.deleteMany({ where: { siteId: { in: demoSiteIds } } });
            await prisma.site.deleteMany({ where: { id: { in: demoSiteIds } } });
        }
        await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
    }

    await prisma.admin.deleteMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } } });
}

async function seedUsersAndSites() {
    const hashedPassword = await hashPassword(DEMO_PASSWORD);
    let siteCatalogIndex = 0;
    const createdSites = [];

    for (const userDef of USERS) {
        const emailLocal = userDef.fullName.toLowerCase().replace(/\s+/g, '.');
        const user = await prisma.user.create({
            data: {
                fullName: userDef.fullName,
                email: `${emailLocal}@${DEMO_DOMAIN}`,
                password: hashedPassword,
                status: userDef.status,
                isEmailVerified: userDef.isEmailVerified,
            },
        });

        for (let i = 0; i < userDef.siteCount; i++) {
            const siteDef = SITES_CATALOG[siteCatalogIndex % SITES_CATALOG.length];
            siteCatalogIndex++;
            const site = await prisma.site.create({
                data: {
                    name: siteDef.name,
                    domain: siteDef.domain,
                    apiKey: generateApiKey(),
                    userId: user.id,
                },
            });
            createdSites.push(site);
        }
    }

    return createdSites;
}

async function seedEventsForSite(site) {
    const visitorCount = randomInt(15, 40);
    const visitorIds = Array.from({ length: visitorCount }, () => crypto.randomUUID());
    const eventCount = randomInt(50, 150);

    const events = [];
    for (let i = 0; i < eventCount; i++) {
        const type = Math.random() < 0.7 ? 'PAGE_VIEW' : 'PRODUCT_CLICK';
        const visitorId = pick(visitorIds);
        const referrer = pick(REFERRERS);
        const createdAt = randomDateWithinLastNDays(30);

        if (type === 'PRODUCT_CLICK') {
            const product = pick(PRODUCTS);
            events.push({
                type,
                pageUrl: `https://${site.domain}/products/${product.id}`,
                referrer,
                productId: product.id,
                productName: product.name,
                visitorId,
                siteId: site.id,
                createdAt,
            });
        } else {
            events.push({
                type,
                pageUrl: `https://${site.domain}${pick(PAGE_PATHS)}`,
                referrer,
                productId: null,
                productName: null,
                visitorId,
                siteId: site.id,
                createdAt,
            });
        }
    }

    await prisma.event.createMany({ data: events });
    return events.length;
}

async function seedExtraAdmins() {
    const hashedPassword = await hashPassword(DEMO_PASSWORD);

    for (const adminDef of EXTRA_ADMINS) {
        const emailLocal = adminDef.fullName.toLowerCase().replace(/\s+/g, '.');
        const data = {
            fullName: adminDef.fullName,
            email: `${emailLocal}@${DEMO_DOMAIN}`,
            role: adminDef.role,
        };

        if (adminDef.status === 'active') {
            data.password = hashedPassword;
            data.isActive = true;
        } else {
            data.inviteToken = crypto.randomBytes(24).toString('hex');
            data.inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            data.isActive = false;
        }

        await prisma.admin.create({ data });
    }
}

async function main() {
    console.log('Clearing previous demo data...');
    await clearPreviousDemoData();

    console.log('Seeding users and sites...');
    const sites = await seedUsersAndSites();

    console.log('Seeding events...');
    let totalEvents = 0;
    for (const site of sites) {
        totalEvents += await seedEventsForSite(site);
    }

    console.log('Seeding extra admins...');
    await seedExtraAdmins();

    console.log('\nDone.');
    console.log(`  ${USERS.length} users created (password for all: "${DEMO_PASSWORD}")`);
    console.log(`  ${sites.length} sites created`);
    console.log(`  ${totalEvents} events created`);
    console.log(`  ${EXTRA_ADMINS.length} extra admins created (password for active one: "${DEMO_PASSWORD}")`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
