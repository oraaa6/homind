import { CalendarOutlined } from '@ant-design/icons';
import { Col, DatePicker, Form, Row, Select, Tag } from 'antd';
import SectionCard from '@/components/section-card';
import {
    isMaintenanceDateBeforeToday,
    maintenanceRecurrenceOptions,
} from '@/pages/maintenance/utils';

export default function ScheduleStep({
    isScheduled,
    onScheduledChange,
    appointmentError,
    dueError,
    recurrenceError,
}: {
    isScheduled: boolean;
    onScheduledChange: (isScheduled: boolean) => void;
    appointmentError?: string;
    dueError?: string;
    recurrenceError?: string;
}) {
    return (
        <SectionCard
            number="02"
            title="Termin i status realizacji"
            className="xl:p-9"
        >
            <Form.Item
                label="Czy serwis jest już umówiony?"
                className="mb-5!"
            >
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {[
                        { value: false, label: 'Nie, jeszcze nie' },
                        { value: true, label: 'Tak, jest umówiony' },
                    ].map((option) => (
                        <Tag.CheckableTag
                            key={String(option.value)}
                            checked={isScheduled === option.value}
                            onChange={() => onScheduledChange(option.value)}
                            className="m-0! rounded-full! border! border-transparent! bg-tertiary! px-4! py-2! text-sm! text-(--button-text)! hover:bg-surface-muted! sm:text-base! [&.ant-tag-checkable-checked]:border-primary! [&.ant-tag-checkable-checked]:bg-primary-soft! [&.ant-tag-checkable-checked]:text-primary! [&.ant-tag-checkable-checked:hover]:bg-primary-soft!"
                        >
                            {option.label}
                        </Tag.CheckableTag>
                    ))}
                </div>
            </Form.Item>

            <Row gutter={[20, 0]}>
                <Col xs={24} md={12}>
                    {isScheduled ? (
                        <Form.Item
                            label="Termin i godzina umówionej wizyty"
                            name="appointment_at"
                            preserve={false}
                            validateStatus={appointmentError ? 'error' : undefined}
                            help={appointmentError}
                            rules={[
                                {
                                    required: true,
                                    message: 'Wybierz termin umówionej wizyty.',
                                },
                            ]}
                            required
                        >
                            <DatePicker
                                size="large"
                                showTime={{ format: 'HH:mm' }}
                                format="DD.MM.YYYY HH:mm"
                                placeholder="Wybierz termin wizyty"
                                disabledDate={isMaintenanceDateBeforeToday}
                                className="w-full! bg-tertiary!"
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            label="Do kiedy należy umówić serwis?"
                            name="due_at"
                            preserve={false}
                            validateStatus={dueError ? 'error' : undefined}
                            help={dueError}
                            extra="Na podstawie tej daty wyliczymy pilność serwisu."
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Wybierz termin, do którego należy umówić serwis.',
                                },
                            ]}
                            required
                        >
                            <DatePicker
                                size="large"
                                format="DD.MM.YYYY"
                                placeholder="Wybierz termin"
                                disabledDate={isMaintenanceDateBeforeToday}
                                className="w-full! bg-tertiary!"
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    )}
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Cykliczność / Powtarzalność"
                        name="recurrence"
                        validateStatus={recurrenceError ? 'error' : undefined}
                        help={recurrenceError}
                        className="mb-0!"
                    >
                        <Select
                            size="large"
                            className="w-full!"
                            options={maintenanceRecurrenceOptions}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </SectionCard>
    );
}
