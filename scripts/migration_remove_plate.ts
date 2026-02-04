
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
    console.log('Dropping plate column from scooters table...');
    try {
        await sql`ALTER TABLE scooters DROP COLUMN IF EXISTS plate CASCADE`;
        console.log('Successfully dropped plate column.');
    } catch (error) {
        console.error('Error dropping column:', error);
    }
    process.exit(0);
}

main().catch(console.error);
