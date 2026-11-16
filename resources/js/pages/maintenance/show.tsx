import { PlusOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Empty } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import MaintenanceCompletionModal from '@/components/maintenance/maintenance-completion-modal';
import MaintenanceServiceCard from '@/components/maintenance/maintenance-service-card';
import SectionCard from '@/components/section-card';
import { maintenance } from '@/routes';
import { add as addMaintenance } from '@/routes/maintenance';
import type { MaintenanceDevice, MaintenanceService } from './types';

export default function MaintenanceShow({
    device,
    services,
}: {
    device: MaintenanceDevice;
    services: MaintenanceService[];
}) {
    const [completionService, setCompletionService] =
        useState<MaintenanceService | null>(null);

    const formUrl = addMaintenance({
        query: { thing_id: device.id },
    }).url;

    const openCompletion = (service: MaintenanceService) => {
        setCompletionService(service);
    };

    const closeCompletion = () => {
        setCompletionService(null);
    };

    return (
        <>
            <Head title={`Utrzymanie · ${device.name}`} />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title={device.name}
                    description={device.category}
                    backLink={{
                        href: maintenance().url,
                        label: 'Wróć',
                    }}
                    primaryButtonProps={{
                        href: formUrl,
                        icon: <PlusOutlined />,
                        children: 'Dodaj plan serwisu',
                    }}
                />

                {services.length ? (
                    services.map((service) => (
                        <MaintenanceServiceCard
                            key={service.id}
                            service={service}
                            onComplete={openCompletion}
                        />
                    ))
                ) : (
                    <SectionCard title="Plany serwisowe">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Nie dodano jeszcze planu serwisu dla tego urządzenia."
                            />
                            <Button
                                href={formUrl}
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                            >
                                Dodaj plan serwisu
                            </Button>
                        </div>
                    </SectionCard>
                )}
            </div>

            {completionService && (
                <MaintenanceCompletionModal
                    key={completionService.id}
                    service={completionService}
                    onClose={closeCompletion}
                />
            )}
        </>
    );
}

MaintenanceShow.layout = {
    breadcrumbs: [{ title: 'Utrzymanie', href: maintenance() }],
};
