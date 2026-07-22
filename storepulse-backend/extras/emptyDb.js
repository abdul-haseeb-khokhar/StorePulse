require('dotenv').config();
const readline = require('node:readline');
const prisma = require('../src/config/prisma');

function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'yes');
        });
    });
}

async function emptyDb() {
    const ok = await confirm(
        'This will permanently delete ALL rows from Event, Site, and User. Type "yes" to continue: ',
    );
    if (!ok) {
        console.log('Aborted. No data was deleted.');
        return;
    }

    // Children before parents: Event -> Site, Site -> User.
    const events = await prisma.event.deleteMany();
    const sites = await prisma.site.deleteMany();
    const users = await prisma.user.deleteMany();

    console.log(`Deleted ${events.count} events, ${sites.count} sites, ${users.count} users.`);
}

emptyDb()
    .catch((error) => {
        console.error('Failed to empty database:', error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
