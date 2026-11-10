import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Empty, Tag } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import { maintenance } from '@/routes';
import { add as addMaintenance } from '@/routes/maintenance';

type MaintenanceService = {
    name: string;
    isScheduled: boolean;
    appointmentAt: string | null;
    dueAt: string | null;
    recurrence: string;
    provider: string;
    phone: string;
    estimatedCost: number;
    notes: string;
};

type MaintenanceDevice = {
    id: string;
    name: string;
    category: string;
    location: string;
};

const recurrenceLabels: Record<string, string> = {
    none: 'Jednorazowo',
    '3-months': 'Co 3 miesiące',
    '6-months': 'Co 6 miesięcy',
    yearly: 'Co 1 rok',
    '2-years': 'Co 2 lata',
};

const formatDate = (value: string | null, includeTime = false) => {
    if (!value) return 'Nie podano';

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'long',
        ...(includeTime ? { timeStyle: 'short' as const } : {}),
    }).format(new Date(value));
};

export default function MaintenanceShow({
    device,
    service,
}: {
    device: MaintenanceDevice;
    service: MaintenanceService | null;
}) {
    const formUrl = addMaintenance({
        query: {
            thing_id: Number(device.id),
            ...(service ? { edit: 1 } : {}),
        },
    }).url;

    return (
        <>
            <Head title={`Utrzymanie · ${device.name}`} />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title={device.name}
                    description={`${device.category} · ${device.location}`}
                    backLink={{
                        href: maintenance().url,
                        label: 'Wróć do utrzymania',
                    }}
                    primaryButtonProps={{
                        href: formUrl,
                        icon: service ? <EditOutlined /> : <PlusOutlined />,
                        children: service ? 'Edytuj serwis' : 'Dodaj serwis',
                    }}
                />

                <SectionCard
                    title={service?.name ?? 'Serwis i przeglądy'}
                    description={
                        service
                            ? 'Zaplanowany serwis tego urządzenia.'
                            : 'Terminy oraz informacje o wykonanych pracach dla tego urządzenia.'
                    }
                    extra={
                        service ? (
                            <Tag
                                color="green"
                                className="m-0! rounded-full! px-3! py-1!"
                            >
                                Umówione
                            </Tag>
                        ) : (
                            <Tag
                                color="default"
                                className="m-0! rounded-full! px-3! py-1!"
                            >
                                Brak terminu
                            </Tag>
                        )
                    }
                >
                    {service ? (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Termin wizyty
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {formatDate(
                                            service.appointmentAt,
                                            true,
                                        )}
                                    </p>
                                </SurfaceBox>
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Cykliczność
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {recurrenceLabels[service.recurrence] ??
                                            service.recurrence}
                                    </p>
                                </SurfaceBox>
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Wykonawca
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {service.provider || 'Nie podano'}
                                    </p>
                                </SurfaceBox>
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Telefon kontaktowy
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {service.phone || 'Nie podano'}
                                    </p>
                                </SurfaceBox>
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Szacowany koszt
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {new Intl.NumberFormat('pl-PL', {
                                            style: 'currency',
                                            currency: 'PLN',
                                            maximumFractionDigits: 0,
                                        }).format(service.estimatedCost)}
                                    </p>
                                </SurfaceBox>
                            </div>
                            {service.notes && (
                                <SurfaceBox>
                                    <p className="text-sm text-(--button-text)">
                                        Notatki i zalecenia
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-foreground">
                                        {service.notes}
                                    </p>
                                </SurfaceBox>
                            )}
                            <p className="text-xs text-(--button-text)">
                                Dane demonstracyjne — nie są zapisywane w bazie.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Nie dodano jeszcze serwisu dla tego urządzenia."
                            />
                            <Button
                                href={formUrl}
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                            >
                                Dodaj serwis
                            </Button>
                        </div>
                    )}
                </SectionCard>
            </div>
        </>
    );
}

MaintenanceShow.layout = {
    breadcrumbs: [{ title: 'Utrzymanie', href: maintenance() }],
};
