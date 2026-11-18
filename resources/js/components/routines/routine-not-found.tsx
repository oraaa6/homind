import { Head } from '@inertiajs/react';
import { Empty } from 'antd';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import { routines as routinesRoute } from '@/routes';

export default function RoutineNotFound() {
    return (
        <>
            <Head title="Nie znaleziono rutyny" />
            <Heading
                title="Nie znaleziono rutyny"
                backLink={{ href: routinesRoute().url, label: 'Wróć do listy' }}
            />
            <SectionCard>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Ta rutyna nie istnieje lub nie jest już dostępna."
                />
            </SectionCard>
        </>
    );
}
