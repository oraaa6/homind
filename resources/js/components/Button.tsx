import type { ButtonProps as AntButtonProps } from 'antd';
import { Button as AntButton } from 'antd';
import clsx from 'clsx';

type ButtonType = 'primary' | 'default' | 'secondary';

type ButtonProps = Omit<AntButtonProps, 'type' | 'variant'> & {
    type?: ButtonType;
};

const disabledClassName = 'disabled:cursor-not-allowed disabled:opacity-80!';

const disabledColors = (border: string, bg: string, text: string) =>
    `disabled:border-[${border}]! disabled:bg-[${bg}]! disabled:text-[${text}]! [&.ant-btn-disabled]:border-[${border}]! [&.ant-btn-disabled]:bg-[${bg}]! [&.ant-btn-disabled]:text-[${text}]!`;

const variantClassName = {
    primary: disabledColors('#4a5d4e', '#4a5d4e', 'white'),
    default: disabledColors('#242728', '#242728', 'white'),
    secondary: `border-[#f9f7f2]! bg-[#f9f7f2]! text-[#434843]! ${disabledColors('#f9f7f2', '#f9f7f2', '#434843')}`,
    ghost: `border-[#777775]! bg-transparent! text-[#434843]! ${disabledColors('#777775', 'transparent', '#434843')}`,
};

function Button({
    className,
    ghost,
    type = 'default',
    ...props
}: ButtonProps) {
    const antdType = type === 'secondary' ? 'default' : type;

    return (
        <AntButton
            className={clsx(
                disabledClassName,
                variantClassName[ghost ? 'ghost' : type],
                className,
            )}
            ghost={ghost}
            type={ghost ? undefined : antdType}
            {...props}
        />
    );
}

export { Button };
export default Button;
