import { HomeOutlined } from '@ant-design/icons';
import { useForm, usePage } from '@inertiajs/react';
import { Form, Input, Modal } from 'antd';
import Button from '@/components/Button';
import { store as storeHousehold } from '@/routes/households';

type SharedProps = {
    households?: { id: number; name: string }[];
};

export default function RequiredHouseholdModal() {
    const { households = [] } = usePage<SharedProps>().props;
    const form = useForm({ name: '' });
    const isOpen = households.length === 0;

    return (
        <Modal
            open={isOpen}
            centered
            width={560}
            closable={false}
            keyboard={false}
            mask={{ closable: false }}
            footer={null}
            destroyOnHidden
        >
            <div className="px-1 py-3 sm:px-3 sm:py-5">
                <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-surface-muted text-primary">
                    <HomeOutlined className="text-xl" aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                    Jak nazywa się Twój dom?
                </h2>
                <p className="mt-2 mb-6 text-sm text-(--button-text) sm:text-base">
                    Nadaj mu nazwę, aby zacząć. Później zmienisz ją i dodasz
                    domowników w ustawieniach.
                </p>

                <Form
                    layout="vertical"
                    onFinish={() => form.post(storeHousehold().url)}
                >
                    <Form.Item
                        label="Nazwa domu"
                        required
                        validateStatus={form.errors.name ? 'error' : ''}
                        help={form.errors.name}
                    >
                        <Input
                            prefix={<HomeOutlined />}
                            placeholder="np. Nasz dom"
                            size="large"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            maxLength={255}
                            required
                            autoFocus
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={form.processing}
                        className="w-full sm:w-auto"
                    >
                        Utwórz dom i przejdź dalej
                    </Button>
                </Form>
            </div>
        </Modal>
    );
}
