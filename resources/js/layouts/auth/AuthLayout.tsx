import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
    return (
        <div className="grid min-h-svh md:grid-cols-2">
            <div
                className="relative hidden bg-cover bg-center md:block md:min-h-svh"
                style={{ backgroundImage: "url('/images/auth-image.webp')" }}
            >
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-linear-to-t from-black/80 via-black/50 to-transparent px-8 pt-32 pb-8 text-left text-white md:px-12 md:pb-12">
                    <h1 className="text-3xl leading-tight font-bold md:text-5xl">
                        Harmonia w domu
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-white/90 md:text-xl">
                        Doświadcz płynnej kontroli i głębokiego komfortu. Twój
                        inteligentny ekosystem intuicyjnie dopasowuje się do
                        Twojego stylu życia.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <img
                        src="/icons/homind-logo.svg"
                        className="mb-24 max-w-64"
                        alt=""
                    />

                    {children}
                </div>
            </div>
        </div>
    );
}
