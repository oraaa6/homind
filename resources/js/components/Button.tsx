import type { ButtonProps as AntButtonProps } from 'antd';
import { Button as AntButton } from 'antd';
import clsx from 'clsx';

type ButtonType = NonNullable<AntButtonProps['type']> | 'secondary' | 'ghost';

type ButtonProps = Omit<AntButtonProps, 'type'> & {
    type?: ButtonType;
};

const disabledClassName = 'disabled:cursor-not-allowed disabled:opacity-80!';

const disabledColors = (border: string, bg: string, text: string) =>
    `disabled:border-[${border}]! disabled:bg-[${bg}]! disabled:text-[${text}]! [&.ant-btn-disabled]:border-[${border}]! [&.ant-btn-disabled]:bg-[${bg}]! [&.ant-btn-disabled]:text-[${text}]!`;

const variantClassName: Partial<Record<ButtonType, string>> = {
    primary: disabledColors('#4a5d4e', '#4a5d4e', 'white'),
    default: disabledColors('#242728', '#242728', 'white'),
    secondary: `border-[#f9f7f2]! bg-[#f9f7f2]! text-[#434843]! ${disabledColors('#f9f7f2', '#f9f7f2', '#434843')}`,
    ghost: `border-[#777775]! bg-transparent! text-[#434843]! ${disabledColors('#777775', 'transparent', '#434843')}`,
};

function Button({ className, ghost, type = 'default', ...props }: ButtonProps) {
    const isGhost = ghost || type === 'ghost';
    const antdType: AntButtonProps['type'] =
        type === 'secondary' || type === 'ghost' ? 'default' : type;
    const variantClass = variantClassName[isGhost ? 'ghost' : type];

    return (
        <AntButton
            className={clsx(disabledClassName, variantClass, className)}
            ghost={isGhost}
            type={antdType}
            {...props}
        />
    );
}

export { Button };
export default Button;
