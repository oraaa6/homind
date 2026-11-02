export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8'}>
            <h2
                className={
                    variant === 'small'
                        ? 'text-[1.5rem] font-medium text-black'
                        : 'text-[2.25rem] font-semibold text-black'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="mt-1 text-lg text-(--neutral)">
                    {description}
                </p>
            )}
        </header>
    );
}
