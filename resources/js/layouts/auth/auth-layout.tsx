import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
    return (
        <div className="min-h-svh bg-background">
            <div className="mx-auto grid min-h-svh w-full max-w-[1980px] md:grid-cols-2">
                <div
                    className="relative hidden bg-cover bg-center md:block md:min-h-svh"
                    style={{
                        backgroundImage: "url('/images/auth-image.webp')",
                    }}
                >
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-linear-to-t from-black/80 via-black/50 to-transparent px-4 pt-32 pb-8 text-left text-white lg:px-12 lg:pb-12">
                        <h1 className="text-center text-4xl leading-tight font-bold lg:text-5xl">
                            Harmonia w&nbsp;domu
                        </h1>
                        <p className="mt-4 text-center text-base leading-relaxed text-white/90 lg:text-lg">
                            Doświadcz płynnej kontroli i&nbsp;głębokiego
                            komfortu.
                            <br />
                            Twój inteligentny ekosystem intuicyjnie dopasowuje
                            się do&nbsp;Twojego stylu życia.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-6 md:p-10">
                    <div className="h-full w-full max-w-sm md:h-auto">
                        <img
                            src="/icons/homind-logo.svg"
                            className="mb-12 max-w-48 lg:mb-24 lg:max-w-64"
                            alt=""
                        />

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
