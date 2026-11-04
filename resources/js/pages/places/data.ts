import { mockThings } from '@/pages/things/data';

export type Place = {
    id: string;
    slug: string;
    name: string;
    kind: 'room' | 'box' | 'rack';
    parentId: string | null;
    qrCode: string | null;
    level: 'ground' | 'first-floor' | 'outside';
    levelLabel: string;
    description: string;
    createdAt: string;
};

export const mockPlaces: Place[] = [
    {
        id: 'LOC-01',
        slug: 'kuchnia',
        name: 'Kuchnia',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Blat kuchenny, szafki i lodówka',
        createdAt: '2026-11-02',
    },
    {
        id: 'LOC-02',
        slug: 'spizarnia',
        name: 'Spiżarnia',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Półki na żywność i zapasy',
        createdAt: '2026-11-01',
    },
    {
        id: 'LOC-03',
        slug: 'salon',
        name: 'Salon',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Szafki, regały i wyposażenie',
        createdAt: '2026-10-31',
    },
    {
        id: 'LOC-04',
        slug: 'pralnia',
        name: 'Pralnia',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Szafa gospodarcza',
        createdAt: '2026-10-30',
    },
    {
        id: 'LOC-05',
        slug: 'sypialnia',
        name: 'Sypialnia',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'first-floor',
        levelLabel: 'Piętro 1',
        description: 'Szuflady i miejsce na zapasy',
        createdAt: '2026-10-29',
    },
    {
        id: 'LOC-06',
        slug: 'garaz',
        name: 'Garaż i warsztat',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'outside',
        levelLabel: 'Budynek zewnętrzny',
        description: 'Regały i narzędzia',
        createdAt: '2026-10-28',
    },
    {
        id: 'LOC-07',
        slug: 'ogrod',
        name: 'Ogród',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'outside',
        levelLabel: 'Otoczenie',
        description: 'Schowek gospodarczy',
        createdAt: '2026-10-27',
    },
    {
        id: 'LOC-08',
        slug: 'lazienka',
        name: 'Łazienka',
        kind: 'room',
        parentId: null,
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Szafki i półki łazienkowe',
        createdAt: '2026-10-26',
    },
    {
        id: 'BOX-01',
        slug: 'narzedzia-warsztatowe',
        name: 'Narzędzia warsztatowe',
        kind: 'box',
        parentId: 'LOC-06',
        qrCode: 'BOX-01',
        level: 'outside',
        levelLabel: 'Budynek zewnętrzny',
        description: 'Garaż i warsztat · pojemnik L-BOXX',
        createdAt: '2026-10-25',
    },
    {
        id: 'BOX-02',
        slug: 'akcesoria-i-sruby',
        name: 'Akcesoria i śruby',
        kind: 'box',
        parentId: 'LOC-06',
        qrCode: 'BOX-02',
        level: 'outside',
        levelLabel: 'Budynek zewnętrzny',
        description: 'Garaż i warsztat · organizer',
        createdAt: '2026-10-24',
    },
    {
        id: 'BOX-03',
        slug: 'elektronika',
        name: 'Elektronika',
        kind: 'box',
        parentId: 'LOC-03',
        qrCode: 'BOX-03',
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Salon · szafka pod biurkiem',
        createdAt: '2026-10-23',
    },
    {
        id: 'RACK-01',
        slug: 'regal-z-narzedziami',
        name: 'Regał z narzędziami',
        kind: 'rack',
        parentId: 'LOC-06',
        qrCode: null,
        level: 'outside',
        levelLabel: 'Budynek zewnętrzny',
        description: 'Garaż i warsztat · regał przy ścianie',
        createdAt: '2026-10-22',
    },
    {
        id: 'RACK-02',
        slug: 'regal-spizarni',
        name: 'Regał spiżarni',
        kind: 'rack',
        parentId: 'LOC-02',
        qrCode: null,
        level: 'ground',
        levelLabel: 'Parter',
        description: 'Spiżarnia · półka 2 na żywność',
        createdAt: '2026-10-21',
    },
];

export function getPlaceThings(placeId: string) {
    const placeIds = [
        placeId,
        ...mockPlaces
            .filter((place) => place.parentId === placeId)
            .map((place) => place.id),
    ];

    return mockThings.filter((thing) => placeIds.includes(thing.placeId));
}

export type PlaceActivity = {
    title: string;
    date: string;
    author: string;
    type: 'added' | 'moved' | 'created';
};

export const mockPlaceDetails: Record<
    string,
    {
        lastScan: { date: string; author: string };
        history: PlaceActivity[];
    }
> = {
    'BOX-01': {
        lastScan: { date: '2026-11-03T18:42:00', author: 'Ola' },
        history: [
            {
                title: 'Dodano: Wkrętarka Bosch GSR 18V',
                date: '2026-11-03T18:42:00',
                author: 'Ola',
                type: 'added',
            },
            {
                title: 'Przeniesiono: Piwnica → Garaż i warsztat',
                date: '2026-10-30T11:20:00',
                author: 'Tomek',
                type: 'moved',
            },
            {
                title: 'Utworzono tag i wydrukowano etykietę',
                date: '2026-10-25T09:15:00',
                author: 'Ola',
                type: 'created',
            },
        ],
    },
};
