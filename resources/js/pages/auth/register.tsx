import { Button } from '@/components/Button';
import AuthLayout from '@/layouts/auth/AuthLayout';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, Input, message, Spin } from 'antd';
import type { ReactNode } from 'react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = () => {
        post(route('register.store'), {
            onSuccess: () => {
                message.success('Udalo się załozyc konto!');
            },
        });
    };

    return (
        <>
            <Head title="Register" />
            <div>
                <div className="mb-12">
                    <h1 className="heading-3 mb-3">Witamy!</h1>
                    <p className="body-medium">
                        Zarejestruj się i ogranij dom już dziś!
                    </p>
                </div>

                <Form onFinish={handleSubmit} layout="vertical">
                    <div>
                        <Form.Item
                            label="Imię i nazwisko"
                            validateStatus={errors.name ? 'error' : ''}
                        >
                            <Input
                                prefix={<UserOutlined className="mr-1" />}
                                placeholder="Jan Kowalski"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                name="name"
                                autoFocus
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Adres e-mail"
                            validateStatus={errors.email ? 'error' : ''}
                        >
                            <Input
                                prefix={<MailOutlined className="mr-1" />}
                                placeholder="email@example.com"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
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
                                prefix={<LockOutlined className="mr-1" />}
                                placeholder="Hasło"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                name="password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Potwierdzenie hasła"
                            validateStatus={
                                errors.password_confirmation ? 'error' : ''
                            }
                        >
                            <Input.Password
                                prefix={<LockOutlined className="mr-1" />}
                                placeholder="Potwierdzenie hasła"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                name="password_confirmation"
                                size="large"
                            />
                        </Form.Item>

                        <Button
                            className="mt-2 w-full"
                            htmlType="submit"
                            data-test="register-user-button"
                            type="primary"
                        >
                            {processing && <Spin />}
                            Create account
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href={route('login')} tabIndex={6}>
                            Log in
                        </Link>
                    </div>
                </Form>
            </div>
        </>
    );
}

Register.layout = (page: ReactNode) => <AuthLayout children={page} />;
