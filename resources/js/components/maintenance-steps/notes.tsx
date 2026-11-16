import { Form, Input } from 'antd';
import SectionCard from '@/components/section-card';

export default function NotesStep({ error }: { error?: string }) {
    return (
        <SectionCard
            number="04"
            title="Notatki i zalecenia"
            className="xl:p-9"
        >
            <Form.Item
                name="notes"
                className="mb-0!"
                validateStatus={error ? 'error' : undefined}
                help={error}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="np. Wymienić anody magnezowe, sprawdzić ciśnienie w naczyniu wzbiorczym oraz pobrać protokół gwarancyjny dla ubezpieczyciela."
                    className="bg-tertiary!"
                />
            </Form.Item>
        </SectionCard>
    );
}
