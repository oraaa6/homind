import { CheckCircleFilled } from '@ant-design/icons';
import { Form, Radio } from 'antd';
import clsx from 'clsx';
import { placeKinds } from '@/components/places/place-kinds';
import SectionCard from '@/components/section-card';
import type { Place } from '@/pages/places/data';
import type { PlaceFormState } from '@/pages/places/form-types';

export default function TypeStep({
    form,
    onKindChange,
}: {
    form: PlaceFormState;
    onKindChange: (kind: Place['kind']) => void;
}) {
    return (
        <SectionCard
            number="01"
            title="Typ lokalizacji lub obiektu"
            extra={
                <span className="text-xs font-medium text-(--button-text) sm:text-sm">
                    Wymagane pola oznaczone *
                </span>
            }
            className="xl:p-9"
        >
            <Form.Item
                label="Wybierz rodzaj przestrzeni"
                required
                className="mb-0!"
            >
                <Radio.Group
                    name="kind"
                    value={form.data.kind}
                    onChange={(event) => onKindChange(event.target.value)}
                    className="grid! w-full grid-cols-1 gap-3 md:grid-cols-3"
                >
                    {Object.entries(placeKinds).map(([kind, option]) => {
                        const selected = form.data.kind === kind;
                        const Icon = option.icon;

                        return (
                            <Radio
                                key={kind}
                                value={kind}
                                className={clsx(
                                    'relative m-0! flex! min-w-0 items-start! rounded-xl border border-transparent p-4! has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary sm:p-5! [&_.ant-radio]:sr-only [&>span:last-child]:w-full [&>span:last-child]:min-w-0 [&>span:last-child]:p-0!',
                                    selected
                                        ? 'border-primary! bg-primary-soft text-primary!'
                                        : 'bg-tertiary text-foreground!',
                                )}
                            >
                                <span className="flex h-full flex-col items-start gap-3">
                                    <span className="flex w-full items-start justify-between gap-3">
                                        <span
                                            className={clsx(
                                                'flex size-10 items-center justify-center rounded-xl text-xl sm:size-11',
                                                selected
                                                    ? 'bg-primary text-(--white)'
                                                    : 'bg-surface-muted text-(--button-text)',
                                            )}
                                        >
                                            <Icon aria-hidden="true" />
                                        </span>
                                        {selected && (
                                            <CheckCircleFilled
                                                aria-hidden="true"
                                                className="text-lg text-primary"
                                            />
                                        )}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold sm:text-base">
                                            {option.title}
                                        </span>
                                        <span className="mt-1 block text-sm text-(--button-text)">
                                            {option.description}
                                        </span>
                                    </span>
                                </span>
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Form.Item>
        </SectionCard>
    );
}
