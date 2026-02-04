
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
    console.log('Starting migration for rental_payments...');

    try {
        // 1. Create table
        console.log('Creating rental_payments table...');
        await sql`
            CREATE TABLE IF NOT EXISTS rental_payments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Table created.');

        // 2. Backfill existing rentals
        console.log('Backfilling existing payment data...');
        const rentals = await sql`SELECT id, amount_paid, created_at FROM rentals WHERE amount_paid > 0`;

        let migratedCount = 0;
        for (const rental of rentals) {
            // Check if payments already exist for this rental
            const payments = await sql`SELECT id FROM rental_payments WHERE rental_id = ${rental.id}`;

            if (payments.length === 0) {
                // Insert initial payment record derived from amount_paid
                await sql`
                    INSERT INTO rental_payments (rental_id, amount, date, notes)
                    VALUES (${rental.id}, ${rental.amount_paid}, ${rental.created_at}, 'Initial payment (migrated)')
                `;
                migratedCount++;
            }
        }
        console.log(`Backfilled ${migratedCount} rentals with initial payment records.`);
        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    process.exit(0);
}

main().catch(console.error);
