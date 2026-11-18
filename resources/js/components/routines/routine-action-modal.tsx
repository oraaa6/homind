import {
    CalendarOutlined,
    CheckOutlined,
    ForwardOutlined,
} from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Alert, DatePicker, Form, Input, message, Modal } from 'antd';
import dayjs from 'dayjs';
import Button from '@/components/Button';
import SurfaceBox from '@/components/surface-box';
import { useFormValidation } from '@/hooks/use-form-validation';
import type {
    Routine,
    RoutineAction,
    RoutineActionFormData,
} from '@/pages/routines/types';
import {
    formatRoutineDate,
    getNextRoutineActionDate,
    getRoutineDelayDays,
    isRoutineActionDateDisabled,
    validateRoutineAction,
} from '@/pages/routines/utils';
import { store } from '@/routes/routines/actions';

export default function RoutineActionModal({
    routine,
    type,
    onClose,
}: {
    routine: Routine;
    type: RoutineAction;
    onClose: () => void;
}) {
    const skipped = type === 'skipped';
    const form = useForm<
        RoutineActionFormData & { type: RoutineAction; version: number }
    >({
        type,
        version: routine.version,
        scheduledFor: routine.nextDueAt,
        actionAt: dayjs().format('YYYY-MM-DD'),
        notes: '',
    });
    const getErrors = (data: RoutineActionFormData) =>
        validateRoutineAction(data, type, routine);

    const validate = useFormValidation(form, getErrors);

    const dateValid =
        form.data.actionAt &&
        dayjs(form.data.actionAt).isValid() &&
        !isRoutineActionDateDisabled(dayjs(form.data.actionAt), routine);

    const nextDueAt =
        Object.keys(getErrors(form.data)).length === 0
            ? getNextRoutineActionDate(routine, { ...form.data, type })
            : null;

    const delay = dateValid
        ? getRoutineDelayDays(form.data.scheduledFor, form.data.actionAt)
        : 0;
    const formError = Object.entries(form.errors).find(
        ([field]) => field !== 'actionAt' && field !== 'notes',
    )?.[1];

    const submit = () => {
        if (!validate()) {
            return;
        }

        form.post(store(routine.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                message.success(
                    skipped
                        ? 'Termin pominięto. Ostatnie wykonanie pozostało bez zmian.'
                        : 'Zapisano wykonanie i wyznaczono kolejny termin.',
                );
            },
        });
    };

    return (
        <Modal
            open
            centered
            width={720}
            onCancel={onClose}
            title={
                <div>
                    <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        {skipped
                            ? 'Pomiń ten termin'
                            : 'Oznacz rutynę jako wykonaną'}
                    </h2>
                    <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                        Rutyna: <strong>{routine.name}</strong>
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="secondary"
                        size="small"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        loading={form.processing}
                        form="routine-action-form"
                        icon={skipped ? <ForwardOutlined /> : <CheckOutlined />}
                    >
                        {skipped ? 'Pomiń ten termin' : 'Zapisz wykonanie'}
                    </Button>
                </div>
            }
            destroyOnHidden
        >
            <SurfaceBox className="my-5 flex flex-wrap items-center gap-2 text-sm text-(--button-text) sm:text-base">
                <CalendarOutlined className="text-primary" aria-hidden="true" />
                <span>Planowany termin:</span>
                <strong className="text-foreground">
                    {formatRoutineDate(form.data.scheduledFor)}
                </strong>
            </SurfaceBox>
            <Form
                id="routine-action-form"
                layout="vertical"
                noValidate
                onFinish={submit}
            >
                {formError && (
                    <Alert
                        type="error"
                        showIcon
                        className="mb-5"
                        title={formError}
                    />
                )}
                {!skipped && (
                    <Form.Item
                        label="Data wykonania"
                        required
                        validateStatus={
                            form.errors.actionAt ? 'error' : undefined
                        }
                        help={form.errors.actionAt}
                        extra={
                            delay > 0
                                ? `Wykonanie po terminie — opóźnienie: ${delay} ${delay === 1 ? 'dzień' : 'dni'}.`
                                : undefined
                        }
                    >
                        <DatePicker
                            size="large"
                            format="DD.MM.YYYY"
                            value={
                                form.data.actionAt
                                    ? dayjs(form.data.actionAt)
                                    : null
                            }
                            disabledDate={(date) =>
                                isRoutineActionDateDisabled(date, routine)
                            }
                            onChange={(value) => {
                                form.setData(
                                    'actionAt',
                                    value?.format('YYYY-MM-DD') ?? '',
                                );
                                form.clearErrors('actionAt');
                            }}
                            className="w-full! bg-tertiary!"
                        />
                    </Form.Item>
                )}
                <Form.Item
                    label={
                        skipped
                            ? 'Powód pominięcia (opcjonalnie)'
                            : 'Notatka (opcjonalnie)'
                    }
                    validateStatus={form.errors.notes ? 'error' : undefined}
                    help={form.errors.notes}
                >
                    <Input.TextArea
                        rows={3}
                        maxLength={2000}
                        className="bg-tertiary!"
                        value={form.data.notes}
                        onChange={(event) => {
                            form.setData('notes', event.target.value);
                            form.clearErrors('notes');
                        }}
                        placeholder={
                            skipped
                                ? 'np. Wyjazd, czynność nie była potrzebna...'
                                : 'Dodatkowe informacje o wykonaniu rutyny'
                        }
                    />
                </Form.Item>
                {skipped && (
                    <p className="mb-4 text-sm text-(--button-text)">
                        Zapiszemy pominięcie w historii. Data ostatniego
                        wykonania pozostanie bez zmian.
                    </p>
                )}
                {nextDueAt && (
                    <p className="mb-5 text-sm font-medium text-foreground">
                        Kolejny termin: {formatRoutineDate(nextDueAt)}
                    </p>
                )}
            </Form>
        </Modal>
    );
}
