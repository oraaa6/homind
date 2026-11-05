import Heading from '@/components/heading';
import PlaceActivityCard from '@/components/places/activity';
import PlaceContents from '@/components/places/contents';
import PlaceLabelCard from '@/components/places/label-card';
import { placeKinds } from '@/components/places/place-kinds';
import Statistics from '@/components/statistics';
import type { Thing } from '@/pages/things/data';
import { places } from '@/routes';
import { show as showPlace } from '@/routes/places';
import { add as addThing } from '@/routes/things';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { message } from 'antd';
import type { Place, PlaceActivity } from './data';

export default function ShowPlace({
    place,
    parentName,
    placePath,
}: {
    place: Place;
    parentName?: string | null;
    placePath?: string;
}) {
    const items: Thing[] = [];
    const history: PlaceActivity[] = [];
    const room = parentName ?? place.name;

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
                description={`#${place.id} · ${placeKinds[place.kind].label} · ${room}`}
                backLink={{
                    href: places().url,
                    label: 'Wróć do listy lokalizacji',
                }}
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
                            description: place.levelLabel,
                        },
                        {
                            label: 'Ostatni skan',
                            value: 'Brak skanów',
                            icon: '/icons/qr-box.svg',
                            description:
                                'Ta lokalizacja nie była jeszcze skanowana',
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
                            room={parentName ?? undefined}
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
