import { EnvironmentOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import ChangeLocationModal from '@/components/things/change-location-modal';
import LocationCard from '@/components/things/location-card';
import LocationHistory from '@/components/things/location-history';
import StorageCard from '@/components/things/storage-card';
import { things } from '@/routes';
import { mockThingDetails, mockThings } from './data';

export default function ShowThing({ element }: { element: string }) {
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const item = mockThings.find((thing) => thing.slug === element);
    const details = mockThingDetails.find(
        (thing) => thing.thingId === item?.id,
    );

    if (!item || !details) {
        return (
            <Heading
                title="Nie znaleziono przedmiotu"
                backLink={{
                    href: things().url,
                    label: 'Wróć do listy przedmiotów',
                }}
            />
        );
    }

    return (
        <>
            <Head title={item.name} />
            <Heading
                title={item.name}
                description={`#${item.id}`}
                backLink={{
                    href: things().url,
                    label: 'Wróć do listy przedmiotów',
                }}
                primaryButtonProps={{
                    children: 'Zmień lokalizację',
                    icon: <EnvironmentOutlined />,
                    onClick: () => setLocationModalOpen(true),
                }}
            />

            <div className="grid gap-5 lg:gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <div className="flex min-w-0 flex-col gap-5 lg:gap-7">
                    <LocationCard details={details} />
                    <LocationHistory history={details.history} />
                </div>
                <StorageCard item={item} details={details} />
            </div>
            {locationModalOpen && (
                <ChangeLocationModal
                    item={item}
                    details={details}
                    onClose={() => setLocationModalOpen(false)}
                />
            )}
        </>
    );
}

ShowThing.layout = {
    breadcrumbs: [{ title: 'Przedmioty', href: things() }],
};
