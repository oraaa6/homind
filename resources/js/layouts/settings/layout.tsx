import { usePage } from '@inertiajs/react';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const isHouseholdSettings = url.startsWith('/settings/households/');

    return (
        <div className="px-4 py-6">
            <Heading
                title="Ustawienia"
                description="Zarządzaj kontem i ustawieniami domu."
            />

            <div
                className={clsx(
                    'min-w-0',
                    isHouseholdSettings ? 'w-full' : 'max-w-2xl',
                )}
            >
                <section
                    className={clsx(
                        'space-y-6',
                        !isHouseholdSettings && 'max-w-xl space-y-12',
                    )}
                >
                    {children}
                </section>
            </div>
        </div>
    );
}
