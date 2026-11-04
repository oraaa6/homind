import {
    EnvironmentOutlined,
    PlusOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import PlaceActivityCard from '@/components/places/activity';
import PlaceContents from '@/components/places/contents';
import PlaceLabelCard from '@/components/places/label-card';
import { placeKinds } from '@/components/places/place-kinds';
import Statistics from '@/components/statistics';
import { places } from '@/routes';
import { show as showPlace } from '@/routes/places';
import { add as addThing } from '@/routes/things';
import { getPlaceThings, mockPlaceDetails, mockPlaces } from './data';

export default function ShowPlace({ element }: { element: string }) {
    const place = mockPlaces.find((item) => item.slug === element);

    if (!place) {
        return (
            <>
                <Head title="Nie znaleziono lokalizacji" />
                <Heading
                    title="Nie znaleziono lokalizacji"
                    backLink={{
                        href: places().url,
                        label: 'Wróć do listy lokalizacji',
                    }}
                />
            </>
        );
    }

    const parent = mockPlaces.find((item) => item.id === place.parentId);
    const items = getPlaceThings(place.id);
    const details = mockPlaceDetails[place.id];
    const lastScan = details?.lastScan;
    const room = parent?.name ?? place.name;
    const path = showPlace(place.slug).url;
    const url =
        typeof window === 'undefined'
            ? path
            : new URL(path, window.location.origin).href;
    const history = details?.history ?? [
        {
            title: `Utworzono lokalizację: ${place.name}`,
            date: `${place.createdAt}T09:00:00`,
            author: 'System',
            type: 'created' as const,
        },
    ];

    return (
        <>
            <Head title={place.name} />
            <Heading
                title={place.name}
                description={`#${place.id} · ${placeKinds[place.kind].label} · ${room}`}
                backLink={{
                    href: places().url,
                    label: 'Wróć do listy lokalizacji',
                }}
                actions={
                    <Button
                        type="secondary"
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() =>
                            message.info(
                                'Drukowanie etykiety będzie dostępne po podłączeniu backendu.',
                            )
                        }
                    >
                        Drukuj etykietę QR
                    </Button>
                }
                secondaryButtonProps={
                    place.kind !== 'room'
                        ? {
                              children: 'Zmień lokalizację',
                              icon: <EnvironmentOutlined />,
                              onClick: () =>
                                  message.info(
                                      'Zmiana lokalizacji będzie dostępna po podłączeniu backendu.',
                                  ),
                          }
                        : undefined
                }
                primaryButtonProps={{
                    children: 'Dodaj przedmiot',
                    icon: <PlusOutlined />,
                    onClick: () => router.visit(addThing().url),
                }}
            />
            <div className="flex min-w-0 flex-col gap-5 sm:gap-7">
                <Statistics
                    valueClassName="text-xl! whitespace-normal sm:text-2xl!"
                    items={[
                        {
                            label: 'Zawartość',
                            value: `${items.length} przedmiotów`,
                            icon: '/icons/catalog.svg',
                            description: 'Wszystkie skatalogowane',
                        },
                        {
                            label: 'Lokalizacja',
                            value: room,
                            icon: '/icons/zone.svg',
                            description: parent?.levelLabel ?? place.levelLabel,
                        },
                        {
                            label: 'Ostatni skan',
                            value: lastScan
                                ? new Intl.DateTimeFormat('pl-PL', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  }).format(new Date(lastScan.date))
                                : 'Brak skanów',
                            icon: '/icons/qr-box.svg',
                            description: lastScan
                                ? `Zeskanowane przez ${lastScan.author}`
                                : 'Ta lokalizacja nie była jeszcze skanowana',
                        },
                    ]}
                />
                <div className="grid items-start gap-5 lg:gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                    <PlaceContents
                        key={place.id}
                        items={items}
                        kind={place.kind}
                    />
                    <div className="flex min-w-0 flex-col gap-5 lg:gap-7">
                        <PlaceLabelCard
                            place={place}
                            room={parent?.name}
                            url={url}
                        />
                        <PlaceActivityCard history={history} />
                    </div>
                </div>
            </div>
        </>
    );
}

ShowPlace.layout = {
    breadcrumbs: [{ title: 'Lokalizacje', href: places() }],
};
