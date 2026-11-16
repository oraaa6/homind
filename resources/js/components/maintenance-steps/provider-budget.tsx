import { UserOutlined } from '@ant-design/icons';
import { Col, Form, Input, InputNumber, Row } from 'antd';
import SectionCard from '@/components/section-card';

export default function ProviderBudgetStep({
    providerError,
    phoneError,
    costError,
}: {
    providerError?: string;
    phoneError?: string;
    costError?: string;
}) {
    return (
        <SectionCard number="03" title="Wykonawca i budżet" className="xl:p-9">
            <Row gutter={[20, 0]}>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Wykonawca / Firma"
                        name="provider"
                        validateStatus={providerError ? 'error' : undefined}
                        help={providerError}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined />}
                            placeholder="np. Serwis HVAC Termo-Partner"
                            className="bg-tertiary!"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Telefon kontaktowy"
                        name="phone"
                        validateStatus={phoneError ? 'error' : undefined}
                        help={phoneError}
                    >
                        <Input
                            size="large"
                            type="tel"
                            placeholder="+48 601 234 567"
                            className="bg-tertiary!"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Szacowany koszt"
                        name="estimated_cost"
                        validateStatus={costError ? 'error' : undefined}
                        help={costError}
                    >
                        <InputNumber
                            min={0}
                            size="large"
                            addonAfter="PLN"
                            placeholder="0"
                            className="w-full! bg-tertiary!"
                        />
                    </Form.Item>
                </Col>
            </Row>
        </SectionCard>
    );
}
