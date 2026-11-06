import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type {
    ThingCategoryOption,
    ThingFormState,
} from '@/pages/things/form-types';
import { store as storeCategory } from '@/routes/categories';
import { PlusOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Form, Input, InputNumber, message, Modal, Select, Tag } from 'antd';
import { useState } from 'react';

const units = ['sztuka', 'opakowanie', 'karton', 'butelka', 'ryza'].map(
    (unit) => ({
        value: unit,
        label: unit,
    }),
);

export default function BasicInformationStep({
    form,
    categories,
}: {
    form: ThingFormState;
    categories: ThingCategoryOption[];
}) {
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const categoryForm = useForm({ category_name: '' });

    const addCategory = () => {
        const name = categoryForm.data.category_name.trim();

        if (!name) {
            return;
        }

        const existingCategory = categories.find(
            (category) =>
                category.name.toLocaleLowerCase('pl') ===
                name.toLocaleLowerCase('pl'),
        );

        if (existingCategory) {
            form.setData('category_id', existingCategory.id);
            setCategoryModalOpen(false);
            categoryForm.reset();

            return;
        }

        categoryForm.post(storeCategory().url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedCategories = page.props
                    .categories as ThingCategoryOption[];
                const createdCategory = updatedCategories.find(
                    (category) => category.name === name,
                );

                if (createdCategory) {
                    form.setData('category_id', createdCategory.id);
                    form.clearErrors('category_id');
                }

                categoryForm.reset();
                setCategoryModalOpen(false);
                message.success('Kategoria została dodana.');
            },
        });
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
                    validateStatus={form.errors.category_id ? 'error' : ''}
                    help={form.errors.category_id}
                >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {categories.map((category) => (
                            <Tag.CheckableTag
                                key={category.id}
                                checked={form.data.category_id === category.id}
                                onChange={(checked) => {
                                    if (checked) {
                                        form.setData(
                                            'category_id',
                                            category.id,
                                        );
                                        form.clearErrors('category_id');
                                    }
                                }}
                                className="m-0! rounded-full! border! border-transparent! bg-tertiary! px-4! py-2! text-sm! text-(--button-text)! hover:bg-surface-muted! sm:text-base! [&.ant-tag-checkable-checked]:border-primary! [&.ant-tag-checkable-checked]:bg-primary-soft! [&.ant-tag-checkable-checked]:text-primary! [&.ant-tag-checkable-checked:hover]:bg-primary-soft!"
                            >
                                {category.name}
                            </Tag.CheckableTag>
                        ))}
                        <Button
                            type="primary"
                            size="small"
                            shape="circle"
                            icon={<PlusOutlined />}
                            aria-label="Dodaj kategorię"
                            onClick={() => setCategoryModalOpen(true)}
                        />
                    </div>
                </Form.Item>

                <div className="mt-6! grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <Form.Item
                        label="Ilość"
                        required
                        validateStatus={form.errors.quantity ? 'error' : ''}
                        help={form.errors.quantity}
                    >
                        <InputNumber
                            min={0}
                            size="large"
                            value={form.data.quantity}
                            onChange={(value) => {
                                form.setData('quantity', value ?? 0);
                                form.clearErrors('quantity');
                            }}
                            className="w-full! bg-tertiary!"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Jednostka"
                        required
                        validateStatus={form.errors.unit ? 'error' : ''}
                        help={form.errors.unit}
                    >
                        <Select
                            size="large"
                            className="w-full!"
                            value={form.data.unit}
                            options={units}
                            onChange={(value) => {
                                form.setData('unit', value);
                                form.clearErrors('unit');
                            }}
                        />
                    </Form.Item>
                </div>
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
                okButtonProps={{
                    disabled: !categoryForm.data.category_name.trim(),
                    loading: categoryForm.processing,
                    size: 'small',
                }}
                cancelButtonProps={{
                    size: 'small',
                    disabled: categoryForm.processing,
                    type: 'text',
                }}
                cancelText="Anuluj"
                onCancel={() => {
                    setCategoryModalOpen(false);
                    categoryForm.reset();
                }}
            >
                <div className="pt-4 pb-3">
                    <Input
                        size="large"
                        value={categoryForm.data.category_name}
                        onChange={(event) => {
                            categoryForm.setData(
                                'category_name',
                                event.target.value,
                            );
                            categoryForm.clearErrors('category_name');
                        }}
                        onPressEnter={addCategory}
                        placeholder="Nazwa kategorii"
                        maxLength={100}
                        status={
                            categoryForm.errors.category_name
                                ? 'error'
                                : undefined
                        }
                    />
                    {categoryForm.errors.category_name && (
                        <p className="mt-2 text-sm text-red-600">
                            {categoryForm.errors.category_name}
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
