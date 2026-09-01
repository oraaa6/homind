import { Form } from '@inertiajs/react';
import { Alert, Button, Input, Modal, Typography } from 'antd';
import type { InputRef } from 'antd';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';

export default function DeleteUser() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<InputRef>(null);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <Alert
                type="error"
                showIcon
                message="Warning"
                description="Please proceed with caution, this cannot be undone."
                action={
                    <Button
                        danger
                        type="primary"
                        data-test="delete-user-button"
                        onClick={() => setOpen(true)}
                    >
                        Delete account
                    </Button>
                }
            />

            <Modal
                title="Are you sure you want to delete your account?"
                open={open}
                footer={null}
                onCancel={() => setOpen(false)}
            >
                <Typography.Paragraph>
                    Once your account is deleted, all of its resources and data
                    will also be permanently deleted. Please enter your password
                    to confirm you would like to permanently delete your
                    account.
                </Typography.Paragraph>

                <Form
                    {...ProfileController.destroy.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onError={() => passwordInput.current?.focus()}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ resetAndClearErrors, processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Input.Password
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={() => {
                                        resetAndClearErrors();
                                        setOpen(false);
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    danger
                                    type="primary"
                                    htmlType="submit"
                                    disabled={processing}
                                    data-test="confirm-delete-user-button"
                                >
                                    Delete account
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
