import { NumberOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Tag } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type { ThingFormState } from '@/pages/things/form-types';

const initialCategories = [
    { value: 'tools', label: 'Elektronarzędzia' },
    {
        value: 'kitchen',
        label: 'Sprzęt kuchenny / AGD',
    },
    { value: 'electronics', label: 'RTV' },
    { value: 'accessories', label: 'Akcesoria' },
    { value: 'other', label: 'Inne' },
];

export default function BasicInformationStep({
    form,
}: {
    form: ThingFormState;
}) {
    const [categories, setCategories] = useState(initialCategories);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const addCategory = () => {
        const label = newCategory.trim();

        if (!label) {
            return;
        }

        const value = `custom-${Date.now()}`;
        setCategories([...categories, { value, label }]);
        form.setData('category', value);
        form.clearErrors('category');
        setNewCategory('');
        setCategoryModalOpen(false);
    };

    return (
        <>
            <SectionCard
                number="01"
                title="Podstawowe informacje"
                className="xl:p-9"
            >
                <Form.Item
                    label="Nazwa przedmiotu"
                    required
                    validateStatus={form.errors.name ? 'error' : ''}
                    help={form.errors.name}
                >
                    <Input
                        name="name"
                        size="large"
                        placeholder="np. Wyrzynarka akumulatorowa Makita DJV180"
                        value={form.data.name}
                        onChange={(event) => {
                            form.setData('name', event.target.value);
                            form.clearErrors('name');
                        }}
                        className="bg-tertiary!"
                    />
                </Form.Item>

                <Form.Item
                    label="Kategoria zasobu"
                    required
                    validateStatus={form.errors.category ? 'error' : ''}
                    help={form.errors.category}
                >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {categories.map((category) => (
                            <Tag.CheckableTag
                                key={category.value}
                                checked={form.data.category === category.value}
                                onChange={(checked) => {
                                    if (checked) {
                                        form.setData(
                                            'category',
                                            category.value,
                                        );
                                        form.clearErrors('category');
                                    }
                                }}
                                className="m-0! rounded-full! border! border-transparent! bg-tertiary! px-4! py-2! text-sm! text-(--button-text)! hover:bg-surface-muted! sm:text-base! [&.ant-tag-checkable-checked]:border-primary! [&.ant-tag-checkable-checked]:bg-surface-muted! [&.ant-tag-checkable-checked]:text-foreground! [&.ant-tag-checkable-checked:hover]:bg-surface-muted!"
                            >
                                {category.label}
                            </Tag.CheckableTag>
                        ))}
                        <Button
                            type="primary"
                            size="small"
                            shape="circle"
                            icon={<PlusOutlined />}
                            aria-label="Nowa kategoria"
                            onClick={() => setCategoryModalOpen(true)}
                        />
                    </div>
                </Form.Item>

                <Form.Item
                    label="Numer seryjny / Identyfikator (SN)"
                    className="mb-0!"
                >
                    <Input
                        name="serialNumber"
                        size="large"
                        prefix={<NumberOutlined />}
                        placeholder="np. MK–89240–2023"
                        value={form.data.serialNumber}
                        onChange={(event) =>
                            form.setData('serialNumber', event.target.value)
                        }
                        className="bg-tertiary!"
                    />
                </Form.Item>
            </SectionCard>

            <Modal
                title={
                    <span className="text-xl font-semibold sm:text-2xl">
                        Nowa kategoria
                    </span>
                }
                open={categoryModalOpen}
                onOk={addCategory}
                okText="Dodaj"
                okButtonProps={{ disabled: !newCategory.trim(), size: 'small' }}
                cancelButtonProps={{ size: 'small' }}
                cancelText="Anuluj"
                onCancel={() => {
                    setCategoryModalOpen(false);
                    setNewCategory('');
                }}
            >
                <div className="pt-4 pb-3">
                    <Input
                        size="large"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        onPressEnter={addCategory}
                        placeholder="Nazwa kategorii"
                        maxLength={60}
                    />
                </div>
            </Modal>
        </>
    );
}
