
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

    const scooters = [
        {
            name: 'Austin Ranger',
            slug: 'austin-ranger',
            image: '/Austin-ranger.webp',
            engine: '50',
            speed: '65',
            price: 120,
            status: 'available',
            desc: {
                en: 'The Austin Ranger is a rugged and reliable 50cc scooter built for urban exploration. With its distinct styling and practical design, it offers a smooth ride and excellent fuel efficiency. Perfect for navigating city streets with ease and confidence.',
                fr: "L'Austin Ranger est un scooter 50cc robuste et fiable conçu pour l'exploration urbaine. Avec son style distinct et sa conception pratique, il offre une conduite souple et une excellente efficacité énergétique. Parfait pour naviguer dans les rues de la ville avec aisance et confiance.",
                ar: 'أوستن رينجر هو سكوتر قوي وموثوق بسعة 50 سي سي مصمم للاستكشاف الحضري. بفضل تصميمه المميز والعملي، يوفر تجربة قيادة سلسة وكفاءة ممتازة في استهلاك الوقود. مثالي للتنقل في شوارع المدينة بسهولة وثقة.'
            },
            features: {
                en: ["Automatic Transmission", "Electric Start", "Under-seat Storage", "Fuel Efficient"],
                fr: ["Transmission Automatique", "Démarrage Électrique", "Rangement sous le siège", "Économe en carburant"],
                ar: ["ناقل حركة أوتوماتيكي", "تشغيل كهربائي", "تخزين تحت المقعد", "موفر للوقود"]
            }
        },
        {
            name: 'Austin Strada',
            slug: 'austin-strada',
            image: '/Austin-strada.webp',
            engine: '50',
            speed: '65',
            price: 120,
            status: 'available',
            desc: {
                en: 'Experience the city like never before with the Austin Strada. This 50cc scooter combines sporty aesthetics with everyday practicality. Lightweight and agile, it handles traffic effortlessly while delivering a comfortable ride for daily commutes.',
                fr: "Découvrez la ville comme jamais auparavant avec l'Austin Strada. Ce scooter 50cc allie esthétique sportive et praticité au quotidien. Léger et agile, il gère la circulation sans effort tout en offrant une conduite confortable pour les trajets quotidiens.",
                ar: 'اكتشف المدينة كما لم تفعل من قبل مع أوستن سترادا. يجمع هذا السكوتر بسعة 50 سي سي بين الجماليات الرياضية والعملية اليومية. خفيف الوزن وسريع الحركة، يتعامل مع حركة المرور بجهد قليل بينما يوفر ركوبًا مريحًا للتنقلات اليومية.'
            },
            features: {
                en: ["Sporty Design", "Agile Handling", "Digital Dashboard", "LED Lights"],
                fr: ["Design Sportif", "Maniabilité Agile", "Tableau de Bord Numérique", "Feux LED"],
                ar: ["تصميم رياضي", "تحكم رشيق", "لوحة قيادة رقمية", "أضواء LED"]
            }
        },
        {
            name: 'Sym Orbit',
            slug: 'sym-orbit',
            image: '/Sym-orbit.webp',
            engine: '50',
            speed: '65',
            price: 140,
            status: 'available',
            desc: {
                en: 'The Sym Orbit is a smart choice for efficient mobility. Known for its durability and ease of use, this 50cc scooter features a sleek design and user-friendly controls. It provides a stable and economical ride, making it a favorite for students and professionals alike.',
                fr: "Le Sym Orbit est un choix intelligent pour une mobilité efficace. Connu pour sa durabilité et sa facilité d'utilisation, ce scooter 50cc présente un design élégant et des commandes conviviales. Il offre une conduite stable et économique, ce qui en fait un favori des étudiants et des professionnels.",
                ar: 'سيم أوربيت هو خيار ذكي للتنقل الفعال. معروف بمتانته وسهولة استخدامه، يتميز هذا السكوتر بسعة 50 سي سي بتصميم أنيق وتحكم سهل الاستخدام. يوفر رحلة مستقرة واقتصادية، مما يجعله مفضلاً للطلاب والمهنيين على حد سواء.'
            },
            features: {
                en: ["Durable Build", "Spacious Floorboard", "Comfortable Seat", "Reliable Engine"],
                fr: ["Construction Durable", "Plancher Spacieux", "Siège Confortable", "Moteur Fiable"],
                ar: ["بنية متينة", "أرضية واسعة", "مقعد مريح", "محرك موثوق"]
            }
        },
        {
            name: 'Becane R9',
            slug: 'becane-r9',
            image: '/Becane-r9.webp',
            engine: '50',
            speed: '65',
            price: 120,
            status: 'available',
            desc: {
                en: 'The Becane R9 offers a blend of performance and style in the 50cc category. With its dynamic look and responsive handling, it turns heads while cutting through traffic. A reliable companion for those who seek both fun and functionality in their daily ride.',
                fr: "Le Becane R9 offre un mélange de performance et de style dans la catégorie 50cc. Avec son look dynamique et sa maniabilité réactive, il fait tourner les têtes tout en se frayant un chemin dans la circulation. Un compagnon fiable pour ceux qui recherchent à la fois plaisir et fonctionnalité dans leur trajet quotidien.",
                ar: 'يقدم بيكان R9 مزيجًا من الأداء والأناقة في فئة 50 سي سي. بمظهره الديناميكي واستجابته السريعة، يلفت الانتباه أثناء اجتياز حركة المرور. رفيق موثوق لأولئك الذين يبحثون عن المتعة والعملية في رحلتهم اليومية.'
            },
            features: {
                en: ["Dynamic Styling", "Responsive Brakes", "Smooth Suspension", "Modern Dashboard"],
                fr: ["Style Dynamique", "Freins Réactifs", "Suspension Douce", "Tableau de Bord Moderne"],
                ar: ["تصميم ديناميكي", "فرامل استجابة", "نظام تعليق سلس", "لوحة قيادة حديثة"]
            }
        }
    ];

    console.log('Seeding scooters...');
    for (const s of scooters) {
        try {
            await sql`
                INSERT INTO scooters (
                    slug, name, image, engine, speed, price, status,
                    desc_en, desc_fr, desc_ar, features_en, features_fr, features_ar,
                    last_maintenance
                ) VALUES (
                    ${s.slug}, ${s.name}, ${s.image}, ${s.engine}, ${s.speed}, ${s.price}, ${s.status},
                    ${s.desc.en}, ${s.desc.fr}, ${s.desc.ar},
                    ${JSON.stringify(s.features.en)}::jsonb,
                    ${JSON.stringify(s.features.fr)}::jsonb,
                    ${JSON.stringify(s.features.ar)}::jsonb,
                    NOW()
                )
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    image = EXCLUDED.image,
                    engine = EXCLUDED.engine,
                    speed = EXCLUDED.speed,
                    price = EXCLUDED.price,
                    status = EXCLUDED.status,
                    desc_en = EXCLUDED.desc_en,
                    desc_fr = EXCLUDED.desc_fr,
                    desc_ar = EXCLUDED.desc_ar,
                    features_en = EXCLUDED.features_en,
                    features_fr = EXCLUDED.features_fr,
                    features_ar = EXCLUDED.features_ar;
            `;
            console.log(`Inserted/Updated: ${s.name}`);
        } catch (error) {
            console.error(`Error seeding ${s.name}:`, error);
        }
    }
    console.log('Seeding complete.');
    process.exit(0);
}

main().catch(error => {
    console.error('Fatal error in seed script:', error);
    process.exit(1);
});
