
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function main() {
    const { sql } = await import('../lib/db/index');
    console.log('Scanning for orphaned images...');

    // 1. Get all images referenced in DB
    const scooters = await sql`SELECT image FROM scooters`;
    const dbImages = new Set(scooters.map(s => {
        // Remove leading slash if present for comparison
        return s.image?.startsWith('/') ? s.image.substring(1) : s.image;
    }).filter(Boolean));

    console.log(`Found ${dbImages.size} images referenced in the database.`);

    // 2. Get all .webp images in public folder
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    const webpFiles = files.filter(f => f.endsWith('.webp'));

    console.log(`Found ${webpFiles.length} .webp files in public directory.`);

    // 3. Identify orphans
    const orphans = webpFiles.filter(file => {
        // Keep system placeholders or specific assets if needed
        if (file === 'placeholder.webp') return false;

        // Check if file is in DB
        return !dbImages.has(file);
    });

    console.log(`Identified ${orphans.length} orphaned images.`);

    // 4. Delete orphans
    for (const orphan of orphans) {
        const filePath = path.join(publicDir, orphan);
        try {
            // console.log(`Deleting: ${orphan}`); 
            // Uncomment above and comment below to dry run first if unsure, 
            // but for this task we are executing.
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${orphan}`);
        } catch (err) {
            console.error(`Failed to delete ${orphan}:`, err);
        }
    }

    console.log('Cleanup complete.');
    process.exit(0);
}

main().catch(console.error);
