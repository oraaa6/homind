export type Thing = {
    id: string;
    slug: string;
    name: string;
    location: string;
    placeId: number;
    placeKind: 'room' | 'rack' | 'box';
    storagePlaceName?: string | null;
    category: string;
    placement: string | null;
    quantity: number;
    unit: string;
    needsPacking: boolean;
    createdAt: string;
};

export type ThingDetails = {
    thingId: string;
    room: string;
    place: string;
    placementNote: string | null;
    locationCode: string;
    locationUrl: string;
    locationHasQr: boolean;
    history: {
        id: string;
        location: string;
        description: string;
        date: string;
    }[];
};
