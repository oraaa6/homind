import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Checkbox, Flex, Form, Input, Spin } from 'antd';
import type { ReactNode } from 'react';
import Button from '@/components/Button';
import AuthLayout from '@/layouts/auth/auth-layout';
import { store as loginStore } from '@/routes/login';
import { request as passwordRequest } from '@/routes/password';

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
        post(loginStore.url(), {
            onFinish: () => reset('password'),
            onError: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="mb-12">
                <h1 className="heading-3 mb-3">Zaloguj się</h1>
                <p className="body-medium">
                    Zarządzaj swoim domem w jednym miejscu.
                </p>
            </div>

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

                <Button
                    className="mt-12 w-full"
                    htmlType="submit"
                    data-test="login-user-button"
                    type="primary"
                    disabled={!data.email || !data.password}
                >
                    {processing && <Spin />}
                    Zaloguj się
                </Button>

                <Form.Item className="mt-2! mb-6!">
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
                            <Link
                                href={passwordRequest()}
                                className="text-primary"
                            >
                                Nie pamiętasz hasła?
                            </Link>
                        )}
                    </Flex>
                </Form.Item>

                {status && (
                    <Alert
                        title={status}
                        type="success"
                        showIcon
                        className="mb-6 rounded-lg"
                    />
                )}

                {errors.email || errors.password ? (
                    <Alert
                        title="Nieprawidłowy e-mail lub hasło"
                        type="error"
                        showIcon
                        className="mb-6!"
                    />
                ) : null}
            </Form>
        </>
    );
}

Login.layout = (page: ReactNode) => <AuthLayout children={page} />;
