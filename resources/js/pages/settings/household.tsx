import { HomeOutlined, UserAddOutlined } from '@ant-design/icons';
import { Head, useForm } from '@inertiajs/react';
import { Avatar, Form, Input, List, message } from 'antd';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import { update as updateHousehold } from '@/routes/households';
import { store as addHouseholdMember } from '@/routes/households/members';

type HouseholdSettings = {
    id: number;
    name: string;
    users: { id: number; name: string; email: string }[];
};

export default function HouseholdSettingsPage({
    household,
}: {
    household: HouseholdSettings;
}) {
    const nameForm = useForm({ name: household.name });
    const memberForm = useForm({ email: '' });

    return (
        <>
            <Head title={`Ustawienia: ${household.name}`} />
            <div className="space-y-6">
                <SectionCard
                    title="Nazwa domu"
                    description="Nazwa jest widoczna dla wszystkich członków."
                >
                    <Form
                        layout="vertical"
                        onFinish={() =>
                            nameForm.patch(updateHousehold(household.id).url, {
                                onSuccess: () =>
                                    message.success(
                                        'Nazwa domu została zmieniona.',
                                    ),
                            })
                        }
                    >
                        <Form.Item
                            label="Nazwa"
                            required
                            validateStatus={nameForm.errors.name ? 'error' : ''}
                            help={nameForm.errors.name}
                        >
                            <Input
                                prefix={<HomeOutlined />}
                                value={nameForm.data.name}
                                onChange={(event) =>
                                    nameForm.setData('name', event.target.value)
                                }
                                maxLength={255}
                                size="large"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="small"
                            loading={nameForm.processing}
                        >
                            Zapisz nazwę
                        </Button>
                    </Form>
                </SectionCard>

                <SectionCard
                    title="Domownicy"
                    description="Dodaj osobę, która ma już konto w Homind."
                >
                    <Form
                        layout="vertical"
                        onFinish={() =>
                            memberForm.post(
                                addHouseholdMember(household.id).url,
                                {
                                    onSuccess: () => memberForm.reset('email'),
                                },
                            )
                        }
                    >
                        <Form.Item
                            label="Adres e-mail użytkownika"
                            required
                            validateStatus={
                                memberForm.errors.email ? 'error' : ''
                            }
                            help={memberForm.errors.email}
                        >
                            <Input
                                type="email"
                                placeholder="np. osoba@example.com"
                                value={memberForm.data.email}
                                onChange={(event) =>
                                    memberForm.setData(
                                        'email',
                                        event.target.value,
                                    )
                                }
                                size="large"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="small"
                            icon={<UserAddOutlined />}
                            loading={memberForm.processing}
                        >
                            Dodaj do domu
                        </Button>
                    </Form>

                    <List
                        className="mt-8!"
                        dataSource={household.users}
                        rowKey="id"
                        renderItem={(user) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar>
                                            {user.name
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </Avatar>
                                    }
                                    title={user.name}
                                    description={user.email}
                                />
                            </List.Item>
                        )}
                    />
                </SectionCard>
            </div>
        </>
    );
}
