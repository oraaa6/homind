import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, Input, message, Spin } from 'antd';
import type { ReactNode } from 'react';
import Button from '@/components/Button';
import AuthLayout from '@/layouts/auth/auth-layout';
import { login } from '@/routes';
import { store as registerStore } from '@/routes/register';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = () => {
        post(registerStore.url(), {
            onSuccess: () => {
                message.success('Udało się załozyc konto!');
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
                            help={errors.name}
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
                            help={errors.email}
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
                            help={errors.password}
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
                            help={errors.password_confirmation}
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
                            className="mt-12 w-full"
                            htmlType="submit"
                            data-test="register-user-button"
                            type="primary"
                        >
                            {processing && <Spin />}
                            Utwórz konto
                        </Button>
                    </div>

                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        Masz już konto?{' '}
                        <Link
                            href={login()}
                            className="text-primary"
                            tabIndex={6}
                        >
                            Zaloguj się
                        </Link>
                    </div>
                </Form>
            </div>
        </>
    );
}

Register.layout = (page: ReactNode) => <AuthLayout children={page} />;
