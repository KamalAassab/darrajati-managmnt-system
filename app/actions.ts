'use server';

import { revalidatePath } from 'next/cache';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { requireAuth } from '@/lib/auth-checks';
import { sql } from '@/lib/db';
import { ActionState, handleActionError } from '@/lib/safe-action';
import {
    scooterSchema,
    clientSchema,
    rentalSchema,
    expenseSchema,
} from '@/lib/validations';
import { Scooter, Client, Rental, Expense, DashboardStats, RentalWithDetails, AnalyticsData } from '@/types/admin';

// ==================== SCOOTER ACTIONS ====================

export async function getScooters(): Promise<Scooter[]> {
    await requireAuth();

    const rows = await sql`
        SELECT s.*, 
            COUNT(r.id) FILTER (WHERE r.status = 'active') as active_rentals
        FROM scooters s 
        LEFT JOIN rentals r ON s.id = r.scooter_id
        GROUP BY s.id
        ORDER BY s.created_at ASC
    `;

    return rows.map((row: any) => ({
        id: row.id.toString(),
        slug: row.slug || '',
        name: row.name || '',
        image: row.image || '',
        engine: row.engine || '',
        speed: row.speed || '',
        price: Number(row.price || 0),
        quantity: Number(row.quantity || 1),
        activeRentals: Number(row.active_rentals || 0),
        maintenanceCount: Number(row.maintenance_count || 0),
        availableCount: Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)),
        status: (Number(row.maintenance_count || 0) > 0 && Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0)
            ? 'maintenance'
            : (Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0 ? 'rented' : 'available'),
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at?.toString() || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at?.toString() || ''),
    })) as Scooter[];
}

export async function searchScooters(searchTerm: string): Promise<Scooter[]> {
    await requireAuth();

    const ilikeTerm = `%${searchTerm}%`;
    const rows = await sql`
        SELECT s.*,
            COUNT(r.id) FILTER (WHERE r.status = 'active') as active_rentals
        FROM scooters s 
        LEFT JOIN rentals r ON s.id = r.scooter_id
        WHERE s.name ILIKE ${ilikeTerm}
        GROUP BY s.id
        ORDER BY s.name ASC
    `;

    return rows.map((row: any) => ({
        id: row.id.toString(),
        slug: row.slug || '',
        name: row.name || '',
        image: row.image || '',
        engine: row.engine || '',
        speed: row.speed || '',
        price: Number(row.price || 0),
        quantity: Number(row.quantity || 1),
        activeRentals: Number(row.active_rentals || 0),
        maintenanceCount: Number(row.maintenance_count || 0),
        availableCount: Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)),
        status: (Number(row.maintenance_count || 0) > 0 && Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0)
            ? 'maintenance'
            : (Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0 ? 'rented' : 'available'),
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at?.toString() || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at?.toString() || ''),
    })) as Scooter[];
}

export async function getScooterById(id: string): Promise<Scooter | null> {
    await requireAuth();

    const rows = await sql`
        SELECT s.*,
             COUNT(r.id) FILTER (WHERE r.status = 'active') as active_rentals
        FROM scooters s 
        LEFT JOIN rentals r ON s.id = r.scooter_id
        WHERE s.id = ${id}
        GROUP BY s.id
    `;

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return {
        id: row.id.toString(),
        slug: row.slug || '',
        name: row.name || '',
        image: row.image || '',
        engine: row.engine || '',
        speed: row.speed || '',
        price: Number(row.price || 0),
        quantity: Number(row.quantity || 1),
        activeRentals: Number(row.active_rentals || 0),
        maintenanceCount: Number(row.maintenance_count || 0),
        availableCount: Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)),
        status: (Number(row.maintenance_count || 0) > 0 && Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0)
            ? 'maintenance'
            : (Math.max(0, Number(row.quantity || 1) - Number(row.active_rentals || 0) - Number(row.maintenance_count || 0)) === 0 ? 'rented' : 'available'),
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at?.toString() || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at?.toString() || ''),
    };
}


export async function createScooter(prevState: any, formData: FormData): Promise<ActionState> {
    try {
        console.log('Starting createScooter action');
        await requireAuth();
        console.log('Auth check passed');
        // Generate slug from name
        const name = formData.get('name') as string;
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        // Handle image upload
        const imageFile = formData.get('image') as File | null;
        let imagePath = '/placeholder.webp';

        if (imageFile && imageFile.size > 0) {
            try {
                const fs = await import('fs/promises');
                const path = await import('path');
                const buffer = Buffer.from(await imageFile.arrayBuffer());

                // NO OPTIMIZATION: Save raw buffer
                // We'll keep the filename extension as .webp for compatibility with existing DB entries
                // even though it might be a jpeg/png. Browsers usually handle this.
                const webpBuffer = buffer;

                const publicPath = path.join(process.cwd(), 'public');
                const fileName = `${slug.toUpperCase()}.webp`;
                const filePath = path.join(publicPath, fileName);

                await fs.writeFile(filePath, webpBuffer);
                imagePath = `/${fileName}`;
            } catch (error) {
                console.error('Error uploading image:', error);
                return { success: false, message: 'Failed to upload image' };
            }
        }

        const data = {
            name: formData.get('name'),
            engine: formData.get('engine'),
            speed: formData.get('speed'),
            price: formData.get('price'),
            quantity: formData.get('quantity') || 1,
        };

        const validated = scooterSchema.parse(data);

        await sql`
            INSERT INTO scooters (
                slug, name, image, engine, speed, price, quantity, maintenance_count, status
            ) VALUES (
                ${slug},
                ${validated.name},
                ${imagePath},
                ${String(validated.engine)},
                ${String(validated.speed)},
                ${validated.price},
                ${validated.quantity},
                0,
                'available'
            )
        `;

        revalidatePath('/dashboard/scooters');
        revalidatePath('/dashboard');
        return { success: true, message: 'Scooter created successfully' };
    } catch (error) {
        console.error('CRITICAL ERROR in createScooter:', error);
        return handleActionError(error);
    }
}

export async function updateMaintenanceCountAction(id: string, count: number): Promise<ActionState> {
    await requireAuth();

    try {
        await sql`
            UPDATE scooters SET maintenance_count = ${count}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
        `;

        revalidatePath('/dashboard/scooters');
        revalidatePath('/dashboard');
        return { success: true, message: 'Maintenance status updated' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updateScooter(id: string, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        // Handle image upload if a new image is provided
        const imageFile = formData.get('image') as File | null;
        let imagePath: string | null = null;

        if (imageFile && imageFile.size > 0) {
            try {
                const fs = await import('fs/promises');
                const path = await import('path');
                // Generate slug from name for the filename
                const name = formData.get('name') as string;
                const slug = name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');

                // NO OPTIMIZATION: Save raw buffer
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const webpBuffer = buffer;

                const publicPath = path.join(process.cwd(), 'public');
                const fileName = `${slug.toUpperCase()}.webp`;
                const filePath = path.join(publicPath, fileName);

                await fs.writeFile(filePath, webpBuffer);
                imagePath = `/${fileName}`;
            } catch (error) {
                console.error('Error uploading image:', error);
                return { success: false, message: 'Failed to upload image' };
            }
        }

        const data = {
            name: formData.get('name'),
            engine: formData.get('engine'),
            speed: formData.get('speed'),
            price: formData.get('price'),
            quantity: formData.get('quantity') || 1,
        };

        const validated = scooterSchema.parse(data);

        // Build update query - conditionally include image if a new one was uploaded
        // NOTE: We do NOT update maintenance_count here as it's handled separately
        if (imagePath) {
            await sql`
                UPDATE scooters 
                SET 
                    name = ${validated.name}, 
                    image = ${imagePath},
                    engine = ${String(validated.engine)}, 
                    speed = ${String(validated.speed)}, 
                    price = ${validated.price}, 
                    quantity = ${validated.quantity},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
            `;
        } else {
            await sql`
                UPDATE scooters 
                SET 
                    name = ${validated.name}, 
                    engine = ${String(validated.engine)}, 
                    speed = ${String(validated.speed)}, 
                    price = ${validated.price}, 
                    quantity = ${validated.quantity},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
            `;
        }

        revalidatePath('/dashboard/scooters');
        revalidatePath('/dashboard');
        return { success: true, message: 'Scooter updated successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function deleteScooter(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        // Check if scooter has any rental records
        const rentalCheck = await sql`
            SELECT COUNT(*) as count FROM rentals WHERE scooter_id = ${id}
        `;

        const rentalCount = Number(rentalCheck[0]?.count || 0);

        if (rentalCount > 0) {
            return {
                success: false,
                message: `Cannot delete this scooter. It has ${rentalCount} rental record(s) in the system. Please set it to maintenance status instead.`
            };
        }

        // Get the scooter image path before deleting
        const scooter = await sql`SELECT image FROM scooters WHERE id = ${id}`;

        await sql`DELETE FROM scooters WHERE id = ${id}`;

        // Delete the image file if it exists and is not a default/placeholder
        if (scooter.length > 0 && scooter[0].image && scooter[0].image.startsWith('/')) {
            const imagePath = scooter[0].image;
            // Basic check to avoid deleting system assets - assuming uploaded images are what we target
            // and they are in public root or similar. 
            // We'll just check if it's a file we should manage.
            // For safety, let's only delete if it ends in .webp and isn't 'placeholder.webp' or similar if we had one.
            if (imagePath !== '/placeholder.webp') {
                try {
                    const fs = await import('fs/promises');
                    const path = await import('path');
                    const absolutePath = path.join(process.cwd(), 'public', imagePath);
                    await fs.unlink(absolutePath);
                } catch (err: any) {
                    // Ignore error if file doesn't exist, but log others
                    if (err.code !== 'ENOENT') {
                        console.error('Failed to delete image file:', err);
                    }
                }
            }
        }

        revalidatePath('/dashboard/scooters');
        revalidatePath('/dashboard');
        return { success: true, message: 'Scooter deleted successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

// ==================== CLIENT ACTIONS ====================

export async function getClients(): Promise<Client[]> {
    await requireAuth();

    const rows = await sql`
        SELECT 
            c.*, 
            (
                SELECT s.name 
                FROM rentals r 
                JOIN scooters s ON r.scooter_id = s.id 
                WHERE r.client_id = c.id AND r.status = 'active'
                ORDER BY r.created_at DESC 
                LIMIT 1
            ) as current_scooter,
            (
                SELECT r.scooter_matricule 
                FROM rentals r 
                WHERE r.client_id = c.id AND r.status = 'active'
                ORDER BY r.created_at DESC 
                LIMIT 1
            ) as current_scooter_matricule
        FROM clients c 
        ORDER BY c.created_at DESC
    `;

    return rows.map((row: any) => ({
        id: row.id.toString(),
        fullName: row.full_name,
        documentId: row.document_id,
        phone: row.phone,
        currentScooter: row.current_scooter || undefined,
        currentScooterMatricule: row.current_scooter_matricule || undefined,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at || ''),
    }));
}

export async function createClient(prevState: any, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        const data = {
            fullName: formData.get('fullName'),
            documentId: formData.get('documentId'),
            phone: formData.get('phone'),
        };

        const validated = clientSchema.parse(data);

        // Check for existing Document ID
        const existing = await sql`SELECT id FROM clients WHERE document_id = ${validated.documentId}`;
        if (existing.length > 0) {
            return { success: false, message: `A client with Document ID ${validated.documentId} already exists.` };
        }

        await sql`
            INSERT INTO clients (full_name, document_id, phone)
            VALUES (${validated.fullName}, ${validated.documentId}, ${validated.phone})
        `;

        revalidatePath('/dashboard/clients');
        return { success: true, message: 'Client created successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}


export async function updateClient(id: string, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        const data = {
            fullName: formData.get('fullName'),
            documentId: formData.get('documentId'),
            phone: formData.get('phone'),
        };

        const validated = clientSchema.parse(data);

        // Check for existing Document ID (excluding current client)
        const existing = await sql`
            SELECT id FROM clients 
            WHERE document_id = ${validated.documentId} AND id != ${id}
        `;
        if (existing.length > 0) {
            return { success: false, message: `Another client with Document ID ${validated.documentId} already exists.` };
        }

        await sql`
            UPDATE clients 
            SET full_name = ${validated.fullName}, 
                document_id = ${validated.documentId}, 
                phone = ${validated.phone}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `;

        revalidatePath('/clients');
        return { success: true, message: 'Client updated successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function deleteClient(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        // Check if client has any rental records
        const rentalCheck = await sql`
            SELECT COUNT(*) as count FROM rentals WHERE client_id = ${id}
        `;

        const rentalCount = Number(rentalCheck[0]?.count || 0);

        if (rentalCount > 0) {
            return {
                success: false,
                message: `Cannot delete this client. They have ${rentalCount} rental record(s) in the system.`
            };
        }

        await sql`DELETE FROM clients WHERE id = ${id}`;
        revalidatePath('/clients');
        return { success: true, message: 'Client deleted successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

// ==================== RENTAL ACTIONS ====================

export async function getRentals(): Promise<RentalWithDetails[]> {
    await requireAuth();
    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        ORDER BY r.created_at DESC
    `;
    return mapRowsToRentalWithDetails(rows);
}

export async function getActiveRentals(): Promise<RentalWithDetails[]> {
    await requireAuth();
    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        WHERE r.status = 'active'
        ORDER BY r.start_date ASC
    `;
    return mapRowsToRentalWithDetails(rows);
}

export async function getOverdueRentals(): Promise<RentalWithDetails[]> {
    await requireAuth();
    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        WHERE r.status = 'active' AND r.end_date < CURRENT_DATE
        ORDER BY r.end_date ASC
    `;
    return mapRowsToRentalWithDetails(rows);
}

export async function getCompletedRentals(limit: number = 20): Promise<RentalWithDetails[]> {
    await requireAuth();
    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        WHERE r.status = 'completed'
        ORDER BY r.end_date DESC
        LIMIT ${limit}
    `;
    return mapRowsToRentalWithDetails(rows);
}

export async function getLatestRentals(limit: number = 5): Promise<RentalWithDetails[]> {
    await requireAuth();
    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        ORDER BY r.created_at DESC
        LIMIT ${limit}
    `;
    return mapRowsToRentalWithDetails(rows);
}

function mapRowsToRentalWithDetails(rows: any[]): RentalWithDetails[] {
    return rows.map((row: any) => ({
        id: row.id.toString(),
        scooterId: row.scooter_id.toString(),
        clientId: row.client_id.toString(),
        startDate: row.start_date instanceof Date ? row.start_date.toISOString().split('T')[0] : row.start_date,
        endDate: row.end_date instanceof Date ? row.end_date.toISOString() : (row.end_date || ''),
        totalPrice: Number(row.total_price || 0),
        amountPaid: Number(row.amount_paid || 0),
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        hasGuarantee: row.has_guarantee,
        scooterMatricule: row.scooter_matricule,
        notes: row.notes,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at || ''),
        scooter: {
            id: row.scooter_id.toString(),
            name: row.scooter_name,
            image: row.scooter_image || '/placeholder.webp',
        } as any,
        client: {
            id: row.client_id.toString(),
            fullName: row.client_name,
            phone: row.client_phone,
        } as any,
    }));
}

export async function createRental(prevState: any, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        // 1. Extract and Validate Client Data
        const clientData = {
            fullName: formData.get('clientFullName'),
            documentId: formData.get('clientDocumentId'),
            phone: formData.get('clientPhone'),
        };

        const validatedClient = clientSchema.parse(clientData);

        // 2. Client Resolution Logic
        const clients = await sql`
            SELECT id, full_name, phone FROM clients WHERE document_id = ${validatedClient.documentId}
        `;

        let clientId: string | number;

        if (clients.length > 0) {
            const existingClient = clients[0];

            // Conflict Check: detailed comparison to prevent accidental merges
            const newName = validatedClient.fullName.trim().toLowerCase();
            const existingName = existingClient.full_name.trim().toLowerCase();

            // Allow minor case differences, but block completely different names
            // If I type "Ahmed" and existing is "Ahmed T.", that might be okay? 
            // Better to be strict: if names differ significantly, warn the user.
            // For now, let's assume if the CIN matches, it SHOULD be the same person.
            // If the names are different, the user likely made a typo in the CIN.
            if (newName !== existingName) {
                // Check Levenshtein distance or simple includes? 
                // Let's stick to a strict check for safety as requested.
                // But allow if the existing name contains the new name or vice versa 
                // e.g. "Ahmed" vs "Ahmed Taouil"
                if (!existingName.includes(newName) && !newName.includes(existingName)) {
                    return {
                        success: false,
                        message: `Conflict detected: Document ID ${validatedClient.documentId} belongs to "${existingClient.full_name}". You entered "${validatedClient.fullName}". Please verify the Document ID.`
                    };
                }
            }

            clientId = existingClient.id;

            // OPTIONAL: We could update the phone number if it changed, 
            // but to be "safe" and avoid side effects, let's ONLY update if explicitly requested.
            // The user wanted to prevent conflicts. Overwriting phone might be a conflict too.
            // For now: We Link to the existing client. We DO NOT update them.

        } else {
            // New Client - Insert safely
            const newClient = await sql`
                INSERT INTO clients (full_name, document_id, phone)
                VALUES (${validatedClient.fullName}, ${validatedClient.documentId}, ${validatedClient.phone})
                RETURNING id
            `;
            clientId = newClient[0].id;
        }

        // 3. Validation & Business Logic
        const paymentStatus = formData.get('paymentStatus') as string;
        const totalAmount = Number(formData.get('totalPrice') || 0);

        let amountPaid = 0;
        if (paymentStatus === 'paid') {
            amountPaid = totalAmount;
        } else if (paymentStatus === 'partial') {
            amountPaid = Number(formData.get('amountPaid') || 0);
        }

        const rentalData = {
            scooterId: formData.get('scooterId'),
            clientId: clientId,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            totalPrice: totalAmount,
            amountPaid: amountPaid,
            paymentStatus: paymentStatus,
            paymentMethod: formData.get('paymentMethod'),
            hasGuarantee: formData.get('hasGuarantee') === 'on',
            scooterMatricule: formData.get('scooterMatricule') || undefined,
            notes: formData.get('notes') || undefined,
        };

        const validatedRental = rentalSchema.parse(rentalData);

        // Security Check: Verify Scooter Availability
        const scooterCheck = await sql`
            SELECT status, price, quantity FROM scooters WHERE id = ${validatedRental.scooterId}
        `;

        if (scooterCheck.length === 0) {
            throw new Error('Selected asset does not exist.');
        }

        const scooter = scooterCheck[0];
        const quantity = Number(scooter.quantity || 1);

        // Count active rentals for this scooter
        const activeRentals = await sql`
            SELECT COUNT(*) as count FROM rentals 
            WHERE scooter_id = ${validatedRental.scooterId} AND status = 'active'
        `;
        const activeCount = Number(activeRentals[0]?.count || 0);

        if (quantity - activeCount <= 0) {
            return { success: false, message: 'No scooters available (checked maintenance and active rentals).' };
        }

        if (activeCount >= quantity) {
            return { success: false, message: `This scooter is out of stock (${activeCount}/${quantity} rented).` };
        }

        // 4. Commit Rental Record
        const rentalResult = await sql`
            INSERT INTO rentals 
            (scooter_id, client_id, start_date, end_date, total_price, amount_paid,
             payment_status, payment_method, has_guarantee, scooter_matricule, notes)
            VALUES (
                ${validatedRental.scooterId}, 
                ${validatedRental.clientId}, 
                ${validatedRental.startDate}, 
                ${validatedRental.endDate}, 
                ${validatedRental.totalPrice}, 
                ${amountPaid},
                ${validatedRental.paymentStatus}, 
                ${validatedRental.paymentMethod}, 
                ${validatedRental.hasGuarantee || false},
                ${validatedRental.scooterMatricule || null},
                ${validatedRental.notes || null}
            )
            RETURNING id
        `;

        const newRentalId = rentalResult[0].id;

        // 4b. Create Initial Payment Record
        if (amountPaid > 0) {
            await sql`
                INSERT INTO rental_payments (rental_id, amount, date, notes)
                VALUES (${newRentalId}, ${amountPaid}, CURRENT_TIMESTAMP, 'Initial Payment')
            `;
        }

        // 5. Update Asset Status if full - REMOVED legacy status update
        // We no longer manage 'status' column directly for availability logic
        // It is computed dynamically.

        // Synchronization
        revalidatePath('/dashboard/rentals');
        revalidatePath('/dashboard/scooters');
        revalidatePath('/dashboard/clients');
        revalidatePath('/dashboard');

        return { success: true, message: 'Rental created successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function completeRental(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        const rentalRows = await sql`SELECT scooter_id FROM rentals WHERE id = ${id}`;

        await sql`
            UPDATE rentals 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `;

        if (rentalRows[0]) {
            const scooterId = rentalRows[0].scooter_id;

            // Check stock to see if we should make it available
            const scooterInfo = await sql`SELECT quantity FROM scooters WHERE id = ${scooterId}`;
            const activeRentals = await sql`SELECT COUNT(*) as count FROM rentals WHERE scooter_id = ${scooterId} AND status = 'active'`;

            const quantity = Number(scooterInfo[0]?.quantity || 1);
            const activeCount = Number(activeRentals[0]?.count || 0);

            if (activeCount < quantity) {
                await sql`
                    UPDATE scooters SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = ${scooterId}
                `;
            }
        }

        revalidatePath('/rentals');
        revalidatePath('/scooters');
        return { success: true, message: 'Rental completed successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function revertRental(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        const rentalRows = await sql`SELECT scooter_id FROM rentals WHERE id = ${id}`;

        if (!rentalRows[0]) {
            throw new Error('Rental not found');
        }

        const scooterId = rentalRows[0].scooter_id;

        // Check if scooter is currently available (logic: if it's rented to someone else, we can't revert)
        // However, user asked to force update backend. 
        // We should check if the scooter is currently 'available' or 'maintenance'. 
        // If it is 'rented', we have a conflict.

        const scooterCheck = await sql`SELECT status, quantity FROM scooters WHERE id = ${scooterId}`;
        const quantity = Number(scooterCheck[0]?.quantity || 1);

        // Count active rentals (excluding this one as it's not active yet)
        const activeRentals = await sql`SELECT COUNT(*) as count FROM rentals WHERE scooter_id = ${scooterId} AND status = 'active'`;
        const activeCount = Number(activeRentals[0]?.count || 0);

        if (scooterCheck[0].status === 'maintenance') {
            return { success: false, message: 'Cannot revert: Scooter is under maintenance.' };
        }

        if (activeCount >= quantity) {
            return { success: false, message: `Cannot revert: Scooter is fully rented (${activeCount}/${quantity}).` };
        }

        await sql`
            UPDATE rentals 
            SET status = 'active', updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `;

        // If now full, update status to rented
        if (activeCount + 1 >= quantity) {
            await sql`
                UPDATE scooters SET status = 'rented', updated_at = CURRENT_TIMESTAMP WHERE id = ${scooterId}
            `;
        }

        revalidatePath('/rentals');
        revalidatePath('/scooters');
        return { success: true, message: 'Rental reverted to active successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updateRental(id: string, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        const validatedData = rentalSchema.parse({
            scooterId: formData.get('scooterId'),
            clientId: formData.get('clientId'),
            clientFullName: 'Existing Client',
            clientDocumentId: 'Existing ID',
            clientPhone: 'Existing Phone',
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            totalPrice: Number(formData.get('totalPrice')),
            amountPaid: Number(formData.get('amountPaid')),
            paymentStatus: formData.get('paymentStatus') as any,
            paymentMethod: formData.get('paymentMethod') as any,
            notes: formData.get('notes') || '',
            depositAmount: 0,
            hasDeposit: false,
        });

        await sql`
            UPDATE rentals 
            SET 
                start_date = ${validatedData.startDate},
                end_date = ${validatedData.endDate},
                total_price = ${validatedData.totalPrice},
                amount_paid = ${validatedData.amountPaid},
                payment_status = ${validatedData.paymentStatus},
                payment_method = ${validatedData.paymentMethod},
                notes = ${validatedData.notes ?? null},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `;

        revalidatePath('/dashboard/rentals');
        revalidatePath(`/dashboard/rentals/${id}/edit`);

        return { success: true, message: 'Rental updated successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function deleteRental(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        const rental = await sql`SELECT status, scooter_id FROM rentals WHERE id = ${id}`;

        if (rental.length === 0) {
            throw new Error("Rental not found");
        }

        const { status, scooter_id } = rental[0];

        if (status === 'active') {
            await sql`UPDATE scooters SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = ${scooter_id}`;
        }

        await sql`DELETE FROM rentals WHERE id = ${id}`;

        revalidatePath('/dashboard/rentals');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/scooters');
        return { success: true, message: 'Rental deleted successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getRentalById(id: string): Promise<RentalWithDetails | null> {
    await requireAuth();

    const rows = await sql`
        SELECT 
          r.*,
          s.name as scooter_name, s.image as scooter_image,
          c.full_name as client_name, c.phone as client_phone, c.document_id as client_document_id
        FROM rentals r
        JOIN scooters s ON r.scooter_id = s.id
        JOIN clients c ON r.client_id = c.id
        WHERE r.id = ${id}
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id.toString(),
        scooterId: row.scooter_id.toString(),
        clientId: row.client_id.toString(),
        startDate: row.start_date instanceof Date ? row.start_date.toISOString().split('T')[0] : row.start_date,
        endDate: row.end_date instanceof Date ? row.end_date.toISOString() : (row.end_date || ''),
        totalPrice: Number(row.total_price || 0),
        amountPaid: Number(row.amount_paid || 0),
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        notes: row.notes,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || ''),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at || ''),
        scooter: {
            id: row.scooter_id.toString(),
            name: row.scooter_name,
            plate: row.scooter_plate,
        } as any,
        client: {
            id: row.client_id.toString(),
            fullName: row.client_name,
            phone: row.client_phone,
            documentId: row.client_document_id
        } as any,
    };
}

// ==================== EXPENSE ACTIONS ====================

export async function getExpenses(): Promise<Expense[]> {
    await requireAuth();

    const rows = await sql`
        SELECT * FROM expenses ORDER BY date DESC
    `;

    return rows.map((row: any) => ({
        id: row.id.toString(),
        category: row.category,
        amount: Number(row.amount),
        date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
        description: row.description,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || ''),
    }));
}

export async function createExpense(prevState: any, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        const data = {
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount') as string),
            date: formData.get('date'),
            description: formData.get('description'),
        };

        const validated = expenseSchema.parse(data);

        await sql`
            INSERT INTO expenses (category, amount, date, description) 
            VALUES (${validated.category}, ${validated.amount}, ${validated.date}, ${validated.description})
        `;

        revalidatePath('/dashboard/finances');
        revalidatePath('/dashboard');
        return { success: true, message: 'Expense recorded successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updateExpense(id: string, formData: FormData): Promise<ActionState> {
    await requireAuth();

    try {
        const data = {
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount') as string),
            date: formData.get('date'),
            description: formData.get('description'),
        };

        const validated = expenseSchema.parse(data);

        await sql`
            UPDATE expenses 
            SET 
                category = ${validated.category},
                amount = ${validated.amount},
                date = ${validated.date},
                description = ${validated.description}
            WHERE id = ${id}
        `;

        revalidatePath('/finances');
        return { success: true, message: 'Expense updated successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function deleteExpense(id: string): Promise<ActionState> {
    await requireAuth();

    try {
        await sql`DELETE FROM expenses WHERE id = ${id}`;
        revalidatePath('/finances');
        return { success: true, message: 'Expense deleted successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}


// ==================== DASHBOARD STATS ====================

export async function getDashboardStats(): Promise<DashboardStats> {
    await requireAuth();

    const [revenueRows, expenseRows, activeRentalRows, scooterRows, overdueRows] = await Promise.all([
        sql`SELECT COALESCE(SUM(total_price), 0) as total FROM rentals`,
        sql`SELECT COALESCE(SUM(amount), 0) as total FROM expenses`,
        sql`SELECT COUNT(*) as count FROM rentals WHERE status = 'active'`,
        sql`SELECT 
            SUM(quantity) as total,
            SUM(quantity - maintenance_count) as available_capacity
          FROM scooters`,
        sql`SELECT COUNT(*) as count FROM rentals WHERE status = 'active' AND end_date < CURRENT_DATE`,
    ]);

    const stats = {
        totalRevenue: Number(revenueRows[0]?.total || 0),
        totalExpenses: Number(expenseRows[0]?.total || 0),
        netProfit: 0,
        activeRentals: Number(activeRentalRows[0]?.count || 0),
        overdueRentals: Number(overdueRows[0]?.count || 0),
        availableScooters: Number(scooterRows[0]?.available || 0),
        totalScooters: Number(scooterRows[0]?.total || 0),
    };

    stats.netProfit = stats.totalRevenue - stats.totalExpenses;

    return stats;
}

// ==================== ANALYTICS ACTIONS ====================

export async function getAnalyticsData(filter?: { month?: number; year?: number }): Promise<AnalyticsData> {
    await requireAuth();

    let monthlyStats;

    if (filter?.month && filter?.year) {
        // Specific Month View - Daily Data Points
        const startDate = `${filter.year}-${String(filter.month).padStart(2, '0')}-01`;
        const nextMonth = filter.month === 12
            ? `${filter.year + 1}-01-01`
            : `${filter.year}-${String(filter.month + 1).padStart(2, '0')}-01`;

        monthlyStats = await sql`
            WITH date_points AS (
                SELECT d::date
                FROM generate_series(${startDate}::date, (${nextMonth}::date - INTERVAL '1 day'), '1 day'::interval) d
            )
            SELECT 
                TO_CHAR(d, 'DD Mon') as month_label,
                d as raw_date,
                (SELECT COALESCE(SUM(total_price), 0) FROM rentals 
                 WHERE created_at >= d AND created_at < (d + INTERVAL '1 day')) as revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM expenses 
                 WHERE date >= d AND date < (d + INTERVAL '1 day')) as expenses
            FROM date_points
            ORDER BY raw_date ASC
        `;
    } else {
        // All History View (Default) - Bi-monthly Data Points (1st and 15th) from Jan 2026
        monthlyStats = await sql`
            WITH date_points AS (
                SELECT (sm + (off || ' days')::interval)::date as d
                FROM generate_series('2026-01-01'::date, date_trunc('month', CURRENT_DATE), '1 month'::interval) sm
                CROSS JOIN (VALUES (0), (14)) AS offsets(off)
                WHERE (sm + (off || ' days')::interval) <= CURRENT_DATE
            )
            SELECT 
                CASE 
                    WHEN EXTRACT(DAY FROM d) = 1 THEN TO_CHAR(d, 'Mon')
                    ELSE TO_CHAR(d, 'Mon') || ' 15'
                END as month_label,
                d as raw_date,
                (SELECT COALESCE(SUM(total_price), 0) FROM rentals 
                 WHERE created_at >= d AND created_at < (
                     CASE 
                        WHEN EXTRACT(DAY FROM d) = 1 THEN d + INTERVAL '14 days'
                        ELSE date_trunc('month', d) + INTERVAL '1 month'
                     END
                 )) as revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM expenses 
                 WHERE date >= d AND date < (
                     CASE 
                        WHEN EXTRACT(DAY FROM d) = 1 THEN d + INTERVAL '14 days'
                        ELSE date_trunc('month', d) + INTERVAL '1 month'
                     END
                 )) as expenses
            FROM date_points
            ORDER BY raw_date ASC
        `;
    }

    // 2. Top Performing Scooters (By Revenue)
    const topScooters = await sql`
        SELECT 
            s.id, 
            s.name,
            s.image, 
            COUNT(r.id) as trips,
            COALESCE(SUM(r.total_price), 0) as revenue
        FROM scooters s
        JOIN rentals r ON r.scooter_id = s.id
        GROUP BY s.id, s.name, s.image
        ORDER BY revenue DESC
        LIMIT 5
    `;

    // 3. Generate Smart Tips
    const tips: string[] = [];

    const totalScooters = await sql`SELECT COUNT(*) as count FROM scooters`;
    const activeRentals = await sql`SELECT COUNT(*) as count FROM rentals WHERE status = 'active'`;
    const utilization = Number(activeRentals[0].count) / (Number(totalScooters[0].count) || 1);

    if (utilization < 0.3) {
        tips.push("Only 30% of your scooters are rented right now. Try offering weekend discounts to attract more customers.");
    } else if (utilization > 0.8) {
        tips.push("Great news! Over 80% of your scooters are rented. You might want to buy more scooters to meet demand.");
    }

    const currentMonthRevenue = Number(monthlyStats[monthlyStats.length - 1]?.revenue || 0);
    const lastMonthRevenue = Number(monthlyStats[monthlyStats.length - 2]?.revenue || 0);

    if (currentMonthRevenue > lastMonthRevenue * 1.2 && lastMonthRevenue > 0) {
        tips.push("Excellent work! Your revenue went up 20% this month compared to last month.");
    } else if (currentMonthRevenue < lastMonthRevenue * 0.8 && lastMonthRevenue > 0) {
        tips.push("Your revenue dropped 20% this month. Consider boosting your marketing or offering promotions.");
    }

    const currentMonthExpenses = Number(monthlyStats[monthlyStats.length - 1]?.expenses || 0);
    if (currentMonthExpenses > currentMonthRevenue * 0.5) {
        tips.push("Watch out! Your expenses are taking up more than half of your revenue this month. Look for ways to cut costs.");
    }

    if (tips.length === 0) {
        tips.push("Everything looks good! Your business is running smoothly. Keep it up!");
    }

    return {
        monthlyStats: monthlyStats.map((row: any) => ({
            month: row.month_label,
            revenue: Number(row.revenue),
            expenses: Number(row.expenses),
            profit: Number(row.revenue) - Number(row.expenses)
        })),
        topScooters: topScooters.map((row: any) => ({
            id: row.id.toString(),
            name: row.name,
            image: row.image,
            revenue: Number(row.revenue),
            trips: Number(row.trips)
        })),
        tips
    };
}

// ==================== RENTAL PAYMENT ACTIONS ====================

import { RentalPayment } from '@/types/admin';

export async function addRentalPayment(rentalId: string, amount: number, date: string, notes?: string): Promise<ActionState> {
    await requireAuth();
    try {
        // 1. Insert Payment
        await sql`
            INSERT INTO rental_payments (rental_id, amount, date, notes)
            VALUES (${rentalId}, ${amount}, ${date}, ${notes ?? null})
        `;

        // 2. Update Rental Totals
        // Get current total paid
        const payments = await sql`SELECT SUM(amount) as total FROM rental_payments WHERE rental_id = ${rentalId}`;
        const totalPaid = Number(payments[0].total || 0);

        // Get rental total price
        const rental = await sql`SELECT total_price FROM rentals WHERE id = ${rentalId}`;
        const totalPrice = Number(rental[0].total_price || 0);

        // Determine status
        let paymentStatus = 'pending';
        if (totalPaid >= totalPrice) {
            paymentStatus = 'paid';
        } else if (totalPaid > 0) {
            paymentStatus = 'partial';
        }

        // Update rental
        await sql`
            UPDATE rentals 
            SET amount_paid = ${totalPaid}, payment_status = ${paymentStatus}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${rentalId}
        `;

        revalidatePath('/dashboard/rentals');
        return { success: true, message: 'Payment added successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getRentalPayments(rentalId: string): Promise<RentalPayment[]> {
    await requireAuth();
    const rows = await sql`
        SELECT * FROM rental_payments WHERE rental_id = ${rentalId} ORDER BY date DESC
    `;
    return rows.map((row: any) => ({
        id: row.id.toString(),
        rentalId: Number(row.rental_id),
        amount: Number(row.amount),
        date: row.date instanceof Date ? row.date.toISOString() : row.date,
        notes: row.notes
    }));
}

export async function deleteRentalPayment(paymentId: string, rentalId: string): Promise<ActionState> {
    await requireAuth();
    try {
        await sql`DELETE FROM rental_payments WHERE id = ${paymentId}`;

        // Update Rental Totals (same logic as add)
        const payments = await sql`SELECT SUM(amount) as total FROM rental_payments WHERE rental_id = ${rentalId}`;
        const totalPaid = Number(payments[0].total || 0);

        const rental = await sql`SELECT total_price FROM rentals WHERE id = ${rentalId}`;
        const totalPrice = Number(rental[0].total_price || 0);

        let paymentStatus = 'pending';
        if (totalPaid >= totalPrice) {
            paymentStatus = 'paid';
        } else if (totalPaid > 0) {
            paymentStatus = 'partial';
        }

        await sql`
            UPDATE rentals 
            SET amount_paid = ${totalPaid}, payment_status = ${paymentStatus}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${rentalId}
        `;

        revalidatePath('/dashboard/rentals');
        return { success: true, message: 'Payment deleted successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}

// ==================== AUTHENTICATION ACTIONS ====================

// Basic in-memory rate limiting
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): { blocked: boolean; timeLeft?: number } {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier);

    if (!attempts) {
        return { blocked: false };
    }

    if (attempts.count >= MAX_ATTEMPTS) {
        const timePassed = now - attempts.firstAttempt;
        if (timePassed < BLOCK_DURATION) {
            return {
                blocked: true,
                timeLeft: Math.ceil((BLOCK_DURATION - timePassed) / 1000 / 60)
            };
        }
        // Reset after block duration
        loginAttempts.delete(identifier);
        return { blocked: false };
    }

    return { blocked: false };
}

function recordAttempt(identifier: string) {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier);

    if (!attempts) {
        loginAttempts.set(identifier, { count: 1, firstAttempt: now });
    } else {
        loginAttempts.set(identifier, { ...attempts, count: attempts.count + 1 });
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) {
            return 'Please enter both username and password';
        }

        const sanitizedUsername = username.trim();

        if (sanitizedUsername.length < 3) {
            return 'Username must be at least 3 characters';
        }

        const rateLimitStatus = checkRateLimit(sanitizedUsername);
        if (rateLimitStatus.blocked) {
            return `Too many login attempts. Please try again in ${rateLimitStatus.timeLeft} minutes.`;
        }

        await signIn('credentials', {
            username: sanitizedUsername,
            password: password,
            redirect: false,
        });

        loginAttempts.delete(sanitizedUsername);
        return 'success';
    } catch (error) {
        if (error instanceof AuthError) {
            const username = formData.get('username') as string;
            if (username) recordAttempt(username.trim());

            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid username or password';
                case 'CallbackRouteError':
                    return 'Invalid username or password';
                default:
                    return 'Authentication failed. Please try again';
            }
        }
        throw error;
    }
}

export async function logout() {
    try {
        await signOut({ redirectTo: '/' });
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// ==================== USER SETTINGS ACTIONS ====================

import bcrypt from 'bcryptjs';

export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
    try {
        const user = await requireAuth();
        if (!user?.userId) return null;

        const rows = await sql`
            SELECT id, username FROM admin_users WHERE id = ${parseInt(user.userId)}
        `;

        if (rows.length === 0) return null;
        return { id: String(rows[0].id), username: rows[0].username as string };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

export async function updateUsername(newUsername: string): Promise<ActionState> {
    try {
        const user = await requireAuth();
        if (!user?.userId) {
            return { success: false, message: 'Not authenticated' };
        }

        // Validate username
        const trimmedUsername = newUsername.trim();
        if (trimmedUsername.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }
        if (trimmedUsername.length > 50) {
            return { success: false, message: 'Username must be less than 50 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
            return { success: false, message: 'Username can only contain letters, numbers, and underscores' };
        }

        // Check if username is already taken
        const existingUsers = await sql`
            SELECT id FROM admin_users WHERE username = ${trimmedUsername} AND id != ${parseInt(user.userId)}
        `;
        if (existingUsers.length > 0) {
            return { success: false, message: 'Username is already taken' };
        }

        // Update username
        await sql`
            UPDATE admin_users 
            SET username = ${trimmedUsername}
            WHERE id = ${parseInt(user.userId)}
        `;

        revalidatePath('/dashboard/settings');
        return { success: true, message: 'Username updated successfully. Please log out and log back in for changes to take effect.' };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<ActionState> {
    try {
        const user = await requireAuth();
        if (!user?.userId) {
            return { success: false, message: 'Not authenticated' };
        }

        // Validate new password
        if (newPassword.length < 4) {
            return { success: false, message: 'New password must be at least 4 characters' };
        }
        if (newPassword.length > 100) {
            return { success: false, message: 'Password is too long' };
        }

        // Get current password hash
        const users = await sql`
            SELECT password_hash FROM admin_users WHERE id = ${parseInt(user.userId)}
        `;
        if (users.length === 0) {
            return { success: false, message: 'User not found' };
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, users[0].password_hash as string);
        if (!passwordValid) {
            return { success: false, message: 'Current password is incorrect' };
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await sql`
            UPDATE admin_users 
            SET password_hash = ${newPasswordHash}
            WHERE id = ${parseInt(user.userId)}
        `;

        revalidatePath('/dashboard/settings');
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        return handleActionError(error);
    }
}
