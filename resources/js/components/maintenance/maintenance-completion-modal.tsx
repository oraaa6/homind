import { useForm } from '@inertiajs/react';
import { DatePicker, Form, Input, InputNumber, message, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import Button from '@/components/Button';
import { store as storeVisit } from '@/routes/maintenance/services/visits';
import type { MaintenanceService } from '@/pages/maintenance/types';

type CompletionFormValues = {
    performed_at: Dayjs;
    actual_cost?: number;
    notes?: string;
};

type CompletionRequestData = {
    performed_at: string;
    actual_cost?: number;
    notes?: string;
};

export default function MaintenanceCompletionModal({
    service,
    onClose,
}: {
    service: MaintenanceService;
    onClose: () => void;
}) {
    const form = useForm<CompletionRequestData>({
        performed_at: dayjs().format('YYYY-MM-DD'),
        actual_cost: undefined,
        notes: '',
    });

    const submit = (values: CompletionFormValues) => {
        form.transform(() => ({
            performed_at: values.performed_at.format('YYYY-MM-DD'),
            actual_cost: values.actual_cost ?? null,
            notes: values.notes?.trim() || null,
        }));
        form.post(storeVisit(service.id).url, {
            onSuccess: () => {
                onClose();
                message.success('Serwis oznaczono jako wykonany.');
            },
        });
    };

    return (
        <Modal
            title={`Potwierdź wykonanie${service ? `: ${service.name}` : ''}`}
            open
            onCancel={onClose}
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="secondary" size="small" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        form="maintenance-completion-form"
                        loading={form.processing}
                    >
                        Potwierdź wykonanie
                    </Button>
                </div>
            }
            destroyOnHidden
        >
            <p className="mb-5 text-sm text-(--button-text)">
                Potwierdzenie doda wpis do historii. Koszt i notatka są
                opcjonalne.
            </p>
            <Form
                id="maintenance-completion-form"
                layout="vertical"
                initialValues={{ performed_at: dayjs() }}
                onValuesChange={(_, values) => {
                    form.setData((current) => ({
                        ...current,
                        actual_cost: values.actual_cost,
                        notes: values.notes,
                    }));
                    form.clearErrors();
                }}
                onFinish={submit}
            >
                <Form.Item
                    label="Data wykonania"
                    name="performed_at"
                    validateStatus={
                        form.errors.performed_at ? 'error' : undefined
                    }
                    help={form.errors.performed_at}
                    rules={[
                        {
                            required: true,
                            message: 'Wybierz datę wykonania serwisu.',
                        },
                    ]}
                >
                    <DatePicker
                        size="large"
                        format="DD.MM.YYYY"
                        disabledDate={(current) => current.isAfter(dayjs(), 'day')}
                        className="w-full! bg-tertiary!"
                    />
                </Form.Item>
                <Form.Item
                    label="Koszt rzeczywisty"
                    name="actual_cost"
                    validateStatus={
                        form.errors.actual_cost ? 'error' : undefined
                    }
                    help={form.errors.actual_cost}
                >
                    <InputNumber
                        min={0}
                        precision={2}
                        size="large"
                        addonAfter="PLN"
                        placeholder="Opcjonalnie"
                        className="w-full! bg-tertiary!"
                    />
                </Form.Item>
                <Form.Item
                    label="Notatka z wykonania"
                    name="notes"
                    validateStatus={form.errors.notes ? 'error' : undefined}
                    help={form.errors.notes}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Co zostało wykonane? (opcjonalnie)"
                        className="bg-tertiary!"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
