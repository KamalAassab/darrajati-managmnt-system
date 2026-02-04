import { getScooters } from '@/app/actions';
import ScootersPageClient from './ScootersPageClient';

export const dynamic = 'force-dynamic';

export default async function ScootersPage() {
    const scooters = await getScooters();

    return <ScootersPageClient initialScooters={scooters} />;
}
