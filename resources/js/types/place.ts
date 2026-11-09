export const PlaceType = {
    Room: 'room',
    Box: 'box',
    Rack: 'rack',
} as const;

export type PlaceType = (typeof PlaceType)[keyof typeof PlaceType];
