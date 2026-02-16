const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'https://edunexus-api-d69c.onrender.com';
const OLD_URL = 'http://localhost:10000';

const clientDir = path.join(__dirname, 'client', 'src');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(new RegExp(OLD_URL, 'g'), BACKEND_URL);

    if (content !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
        return true;
    }
    return false;
}

function scanDirectory(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            count += scanDirectory(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            if (updateFile(fullPath)) count++;
        }
    });

    return count;
}

console.log('🔄 Updating API URLs...\n');
const updated = scanDirectory(clientDir);
console.log(`\n✨ Done! Updated ${updated} file(s).`);
console.log(`\n📝 Old URL: ${OLD_URL}`);
console.log(`📝 New URL: ${BACKEND_URL}`);
