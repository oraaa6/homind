import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { Checkbox, Flex, Form, Input } from 'antd';
import type { ReactNode } from 'react';
import AuthLayout from '@/layouts/auth/AuthLayout';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

type LoginForm = {
    email: string;
    password: string;
    remember?: boolean;
    [key: string]: string | boolean | undefined;
};

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
            remember: false,
        });

    const handleSubmit = () => {
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="Adres e-mail"
                    validateStatus={errors.email ? 'error' : ''}
                >
                    <Input
                        prefix={
                            <MailOutlined className="mr-1 text-gray-400!" />
                        }
                        placeholder="email@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        name="email"
                        type="email"
                        autoFocus
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="Hasło"
                    validateStatus={errors.password ? 'error' : ''}
                >
                    <Input.Password
                        prefix={
                            <LockOutlined className="mr-1 text-gray-400!" />
                        }
                        placeholder="Hasło"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        name="password"
                        autoComplete="current-password"
                        size="large"
                    />
                </Form.Item>

                <Form.Item className="!mb-6">
                    <Flex justify="space-between" align="center">
                        <Checkbox
                            checked={data.remember as boolean}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        >
                            Zapamiętaj mnie
                        </Checkbox>

                        {canResetPassword && (
                            <Link href={route('password.request')}>
                                Nie pamiętasz hasła?
                            </Link>
                        )}
                    </Flex>
                </Form.Item>
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = (page: ReactNode) => <AuthLayout children={page} />;
