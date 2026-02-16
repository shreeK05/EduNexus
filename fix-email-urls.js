const fs = require('fs');
const path = require('path');

const OLD_URL = 'https://edu-nexus-teal.vercel.app';
const NEW_URL = 'https://edu-nexus-rho.vercel.app';

const files = [
    'server/controllers/announcementController.js',
    'server/controllers/assignmentController.js',
    'server/controllers/classController.js',
    'server/controllers/quizController.js',
    'server/utils/quizReminderScheduler.js'
];

console.log('🔄 Fixing email URLs...\n');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const updated = content.replace(new RegExp(OLD_URL, 'g'), NEW_URL);

        if (content !== updated) {
            fs.writeFileSync(filePath, updated, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.log(`⏭️  Skipped: ${file} (no changes needed)`);
        }
    } else {
        console.log(`❌ Not found: ${file}`);
    }
});

console.log(`\n✨ Done! Updated URLs from:`);
console.log(`   ${OLD_URL}`);
console.log(`   to:`);
console.log(`   ${NEW_URL}`);
