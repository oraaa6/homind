import { DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { message, Popconfirm } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import PlaceActivityCard from '@/components/places/activity';
import ChangePlaceLocationModal from '@/components/places/change-location-modal';
import PlaceContents from '@/components/places/contents';
import PlaceLabelCard from '@/components/places/label-card';
import { placeKinds } from '@/components/places/place-kinds';
import Statistics from '@/components/statistics';
import type { Thing } from '@/pages/things/types';
import { places } from '@/routes';
import { destroy as destroyPlace, show as showPlace } from '@/routes/places';
import { PlaceType } from '@/types/place';
import type { Place, PlaceActivity } from './types';

export default function ShowPlace({
    place,
    things,
    history,
    historyCount,
    historyHasMore,
    parentName,
    placePath,
    rooms,
}: {
    place: Place;
    things: Thing[];
    history: PlaceActivity[];
    historyCount: number;
    historyHasMore: boolean;
    parentName?: string | null;
    placePath?: string;
    rooms: { id: number; name: string }[];
}) {
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const room = parentName ?? place.name;
    const statistics = [
        {
            label: 'Zawartość',
            value: `${things.length} przedmiotów`,
            icon: '/icons/catalog.svg',
            description: 'Wszystkie skatalogowane',
        },
        {
            label: 'Lokalizacja',
            value: room,
            icon: '/icons/zone.svg',
            description: place.levelLabel,
        },
    ];

    const path = placePath ?? showPlace(place.slug).url;
    const url =
        typeof window === 'undefined'
            ? path
            : new URL(path, window.location.origin).href;

    return (
        <>
            <Head title={place.name} />
            <Heading
                title={place.name}
                description={`${place.qrCode ? `#${place.id} · ` : ''}${placeKinds[place.kind].label} · ${room}`}
                backLink={{
                    href: places().url,
                    label: 'Wróć',
                }}
                actions={
                    <Popconfirm
                        title="Usunąć lokalizację na stałe?"
                        description="Można usunąć tylko pustą lokalizację. Najpierw przenieś lub usuń jej zawartość i lokalizacje podrzędne."
                        okText="Usuń na stałe"
                        cancelText="Anuluj"
                        okButtonProps={{ type: 'primary' }}
                        cancelButtonProps={{ type: 'text' }}
                        onConfirm={() => {
                            router.delete(destroyPlace(place.slug).url, {
                                onSuccess: () =>
                                    message.success(
                                        'Lokalizacja została usunięta.',
                                    ),
                                onError: (errors) =>
                                    message.error(
                                        errors.place ??
                                            'Nie udało się usunąć lokalizacji.',
                                    ),
                            });
                        }}
                    >
                        <Button
                            type="secondary"
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Usuń lokalizację
                        </Button>
                    </Popconfirm>
                }
                primaryButtonProps={
                    place.kind !== PlaceType.Room
                        ? {
                              children: 'Zmień lokalizację',
                              icon: <EnvironmentOutlined />,
                              onClick: () => setLocationModalOpen(true),
                          }
                        : undefined
                }
            />
            <div className="flex min-w-0 flex-col gap-5 sm:gap-7">
                <Statistics
                    valueClassName="text-xl! whitespace-normal sm:text-2xl!"
                    items={statistics}
                />
                <div className="flex min-w-0 flex-col gap-5 lg:gap-7">
                    {place.kind !== PlaceType.Room && place.qrCode && (
                        <div className="w-full min-w-0">
                            <PlaceLabelCard
                                place={place}
                                room={parentName ?? undefined}
                                url={url}
                            />
                        </div>
                    )}
                    <PlaceContents
                        key={place.id}
                        items={things}
                        kind={place.kind}
                    />
                </div>
                <PlaceActivityCard
                    history={history}
                    historyCount={historyCount}
                    historyHasMore={historyHasMore}
                />
            </div>
            {locationModalOpen && (
                <ChangePlaceLocationModal
                    place={place}
                    parentName={parentName ?? null}
                    rooms={rooms}
                    onClose={() => setLocationModalOpen(false)}
                />
            )}
        </>
    );
}

ShowPlace.layout = {
    breadcrumbs: [{ title: 'Lokalizacje', href: places() }],
};
