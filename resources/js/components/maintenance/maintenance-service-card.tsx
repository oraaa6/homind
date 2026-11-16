import ActivityList from '@/components/activity-list';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import { destroy as destroyMaintenance } from '@/routes/maintenance/services';
import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { message, Popconfirm, Tag } from 'antd';
import { add as addMaintenance } from '@/routes/maintenance';
import type { MaintenanceService } from '@/pages/maintenance/types';
import {
    formatMaintenanceCost,
    getMaintenanceServiceDetails,
    getMaintenanceStatus,
    MaintenanceStatus,
    maintenanceStatusColors,
} from '@/pages/maintenance/utils';

export default function MaintenanceServiceCard({
    service,
    onComplete,
}: {
    service: MaintenanceService;
    onComplete: (service: MaintenanceService) => void;
}) {
    const status = getMaintenanceStatus(service);
    const editUrl = addMaintenance({
        query: { service_id: service.id },
    }).url;
    const details = getMaintenanceServiceDetails(service);
    const historyEntries = service.history.map((visit) => ({
        id: visit.id,
        title: 'Serwis wykonany',
        description: [
            visit.provider ? `Wykonawca: ${visit.provider}` : null,
            visit.phone ? `Kontakt: ${visit.phone}` : null,
            visit.actualCost !== null
                ? `Koszt: ${formatMaintenanceCost(visit.actualCost)}`
                : null,
            visit.notes,
        ]
            .filter(Boolean)
            .join('\n'),
        date: visit.completedAt,
        author: visit.performedBy,
        type: 'completed' as const,
    }));

    return (
        <SectionCard
            title={service.name}
            description="Plan serwisowy urządzenia"
            extra={
                <Tag
                    color={maintenanceStatusColors[status]}
                    className="m-0! rounded-full! px-3! py-1! font-semibold!"
                >
                    {status}
                </Tag>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                    {details.map((detail) => (
                        <SurfaceBox
                            key={detail.label}
                            className="min-w-0 flex-[1_1_16rem]"
                        >
                            <p className="text-sm text-(--button-text)">
                                {detail.label}
                            </p>
                            <p className="mt-1 font-semibold whitespace-pre-line text-foreground">
                                {detail.value}
                            </p>
                        </SurfaceBox>
                    ))}
                </div>
                <div className="mt-3 mb-3 flex flex-wrap justify-end gap-2 sm:mt-4 sm:mb-4">
                    <Popconfirm
                        title="Usunąć plan serwisu?"
                        description="Historia wykonanych wizyt tego planu również zostanie usunięta. Tej operacji nie można cofnąć."
                        okText="Usuń plan"
                        cancelText="Anuluj"
                        okButtonProps={{ type: 'primary' }}
                        cancelButtonProps={{ type: 'text' }}
                        onConfirm={() =>
                            router.delete(destroyMaintenance(service.id).url, {
                                onSuccess: () =>
                                    message.success(
                                        'Plan serwisu został usunięty.',
                                    ),
                            })
                        }
                    >
                        <Button
                            type="secondary"
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Usuń plan
                        </Button>
                    </Popconfirm>
                    {status !== MaintenanceStatus.Completed && (
                        <Button
                            href={editUrl}
                            type="ghost"
                            size="small"
                            icon={<EditOutlined />}
                        >
                            Edytuj plan
                        </Button>
                    )}
                    {service.isScheduled &&
                        status !== MaintenanceStatus.Completed && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => onComplete(service)}
                            >
                                Potwierdź wykonanie
                            </Button>
                        )}
                </div>
                <div className="flex flex-col gap-3 border-t border-neutral/20 pt-4">
                    <h4 className="font-semibold text-foreground">
                        Historia serwisu
                    </h4>
                    {historyEntries.length ? (
                        <ActivityList
                            entries={historyEntries}
                            hasMore={false}
                        />
                    ) : (
                        <p className="text-sm text-(--button-text)">
                            Nie ma jeszcze wpisów w historii serwisu.
                        </p>
                    )}
                </div>
            </div>
        </SectionCard>
    );
}
