
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
    console.log('Simplifying scooters table schema...');
    try {
        await sql`
            ALTER TABLE scooters 
            DROP COLUMN IF EXISTS features_en CASCADE,
            DROP COLUMN IF EXISTS features_fr CASCADE,
            DROP COLUMN IF EXISTS features_ar CASCADE,
            DROP COLUMN IF EXISTS desc_en CASCADE,
            DROP COLUMN IF EXISTS desc_fr CASCADE,
            DROP COLUMN IF EXISTS desc_ar CASCADE,
            DROP COLUMN IF EXISTS last_maintenance CASCADE
        `;
        console.log('Successfully dropped columns: features_*, desc_*, last_maintenance');
    } catch (error) {
        console.error('Error dropping columns:', error);
    }
    process.exit(0);
}

main().catch(console.error);
