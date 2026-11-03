export type Thing = {
    id: string;
    slug: string;
    name: string;
    location: string;
    category: string;
    quantity: number;
    minimum: number;
    unit: string;
    status: {
        label: string;
        tone: 'danger' | 'success' | 'neutral';
    };
    createdAt: string;
};

export type ThingDetails = {
    thingId: string;
    room: string;
    place: string;
    placementNote: string;
    locationCode: string;
    serialNumber: string | null;
    history: {
        id: string;
        location: string;
        description: string;
        date: string;
    }[];
};

export const mockThings: Thing[] = [
    {
        id: 'ZAP-01',
        slug: 'tabletki-do-zmywarki-all-in-1',
        name: 'Tabletki do zmywarki All-in-1',
        location: 'Szafka pod zlewem · Chemia domowa',
        category: 'kitchen',
        quantity: 3,
        minimum: 15,
        unit: 'szt.',
        status: { label: 'Niski stan', tone: 'danger' },
        createdAt: '2026-11-02',
    },
    {
        id: 'ZAP-02',
        slug: 'kawa-ziarnista-arabica-1-kg',
        name: 'Kawa ziarnista Arabica 1 kg',
        location: 'Spiżarnia · Półka 2 · Żywność',
        category: 'kitchen',
        quantity: 2,
        minimum: 1,
        unit: 'op.',
        status: { label: 'W normie', tone: 'success' },
        createdAt: '2026-11-01',
    },
    {
        id: 'ZAP-03',
        slug: 'mleko-migdalowe-bio-barista',
        name: 'Mleko migdałowe Bio Barista',
        location: 'Lodówka główna · Nabiał i zamienniki',
        category: 'kitchen',
        quantity: 4,
        minimum: 2,
        unit: 'kart.',
        status: { label: 'Ważne: 5 dni', tone: 'neutral' },
        createdAt: '2026-10-31',
    },
    {
        id: 'ZAP-04',
        slug: 'plyn-do-plukania-sensitive',
        name: 'Płyn do płukania Sensitive',
        location: 'Pralnia · Szafa gospodarcza',
        category: 'bathroom',
        quantity: 1,
        minimum: 1,
        unit: 'but.',
        status: { label: 'W normie', tone: 'success' },
        createdAt: '2026-10-30',
    },
    {
        id: 'ZAP-05',
        slug: 'papier-do-drukarki-a4',
        name: 'Papier do drukarki A4',
        location: 'Salon · Szafka pod biurkiem',
        category: 'living-room',
        quantity: 2,
        minimum: 1,
        unit: 'ryz.',
        status: { label: 'W normie', tone: 'success' },
        createdAt: '2026-10-29',
    },
    {
        id: 'ZAP-06',
        slug: 'zarowki-led-e27',
        name: 'Żarówki LED E27',
        location: 'Sypialnia · Szuflada z zapasami',
        category: 'bedroom',
        quantity: 6,
        minimum: 2,
        unit: 'szt.',
        status: { label: 'W normie', tone: 'success' },
        createdAt: '2026-10-28',
    },
    {
        id: 'ZAP-07',
        slug: 'olej-silnikowy-5w-30',
        name: 'Olej silnikowy 5W-30',
        location: 'Garaż · Regał z narzędziami',
        category: 'garage',
        quantity: 1,
        minimum: 1,
        unit: 'but.',
        status: { label: 'W normie', tone: 'success' },
        createdAt: '2026-10-27',
    },
    {
        id: 'ZAP-08',
        slug: 'nawoz-do-roslin-zielonych',
        name: 'Nawóz do roślin zielonych',
        location: 'Ogród · Schowek gospodarczy',
        category: 'garden',
        quantity: 0,
        minimum: 1,
        unit: 'op.',
        status: { label: 'Niski stan', tone: 'danger' },
        createdAt: '2026-10-26',
    },
    {
        id: 'EQ-104',
        slug: 'delonghi-magnifica-s',
        name: 'DeLonghi Magnifica S',
        location: 'Kuchnia · Blat kuchenny A',
        category: 'kitchen',
        quantity: 1,
        minimum: 1,
        unit: 'szt.',
        status: { label: 'Na miejscu', tone: 'success' },
        createdAt: '2025-01-10',
    },
];

export const mockThingDetails: ThingDetails[] = [
    {
        thingId: 'ZAP-01',
        room: 'Kuchnia',
        place: 'Szafka pod zlewem',
        placementNote: 'Chemia domowa',
        locationCode: 'KUCHNIA-SZAFKA-01',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-02',
        room: 'Spiżarnia',
        place: 'Półka 2',
        placementNote: 'Żywność',
        locationCode: 'SPIZARNIA-POLKA-02',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-03',
        room: 'Kuchnia',
        place: 'Lodówka główna',
        placementNote: 'Nabiał i zamienniki',
        locationCode: 'KUCHNIA-LODOWKA',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-04',
        room: 'Pralnia',
        place: 'Szafa gospodarcza',
        placementNote: 'Środki do prania',
        locationCode: 'PRALNIA-SZAFA',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-05',
        room: 'Salon',
        place: 'Szafka pod biurkiem',
        placementNote: 'Artykuły biurowe',
        locationCode: 'SALON-BIURKO',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-06',
        room: 'Sypialnia',
        place: 'Szuflada z zapasami',
        placementNote: 'Oświetlenie',
        locationCode: 'SYPIALNIA-SZUFLADA',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-07',
        room: 'Garaż',
        place: 'Regał z narzędziami',
        placementNote: 'Akcesoria samochodowe',
        locationCode: 'GARAZ-REGAL',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'ZAP-08',
        room: 'Ogród',
        place: 'Schowek gospodarczy',
        placementNote: 'Środki do pielęgnacji roślin',
        locationCode: 'OGROD-SCHOWEK',
        serialNumber: null,
        history: [],
    },
    {
        thingId: 'EQ-104',
        room: 'Kuchnia',
        place: 'Blat kuchenny A',
        placementNote:
            'Półka robocza obok zlewu, bezpośredni dostęp (wolnostojący)',
        locationCode: 'BLAT-A',
        serialNumber: 'SN-982144-IT',
        history: [
            {
                id: 'history-1',
                location: 'Kuchnia › Blat kuchenny A',
                description: 'Przeniesiono z: Garaż › Schowek · Ola',
                date: '2025-01-10',
            },
            {
                id: 'history-2',
                location: 'Garaż › Schowek',
                description: 'Początkowe przypisanie lokalizacji · Ola',
                date: '2024-11-15',
            },
        ],
    },
];
