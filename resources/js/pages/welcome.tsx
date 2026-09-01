import { Head } from '@inertiajs/react';
import clsx from 'clsx';
import Button from '@/components/button';
import { login, register } from '@/routes';
import styles from './styles.module.css';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <main className="relative h-svh overflow-hidden bg-background md:p-6 lg:p-8 xl:p-12">
                <div
                    className={clsx(
                        styles.welcomeImage,
                        'absolute inset-0 bg-cover bg-center md:hidden',
                    )}
                />
                <div className="absolute inset-0 bg-background/55 md:hidden" />

                <section className="relative mx-auto flex h-full w-full max-w-[118rem] items-center justify-center px-6 py-8 md:grid md:grid-cols-2 md:gap-8 md:px-0 md:py-0 lg:gap-12 xl:gap-20">
                    <div className="hidden min-w-0 md:flex md:flex-col md:items-start md:justify-center">
                        <img
                            src="/icons/homind-logo.svg"
                            className="mb-8 w-44 max-w-full lg:mb-10 lg:w-56 xl:mb-16 xl:w-76"
                            alt="Homind"
                        />

                        <h1 className="max-w-184 text-[2.25rem] leading-[1.16] font-bold text-foreground lg:text-[3rem] xl:text-[4.5rem]">
                            Zewnętrzna pamięć Twojego&nbsp;domu.
                        </h1>

                        <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-neutral lg:mt-7 lg:text-[1.1875rem] xl:mt-10 xl:text-[1.5rem]">
                            Uporządkowana przestrzeń do&nbsp;zarządzania domem.
                            Planuj zadania, kontroluj rzeczy i&nbsp;dbaj
                            o&nbsp;dom z&nbsp;lekką prostotą.
                        </p>

                        <div className="mt-8 flex gap-4 lg:mt-10 lg:gap-5 xl:mt-16 xl:gap-6">
                            <Button
                                href={register.url()}
                                type="primary"
                                className="h-14! min-w-36! rounded-lg! text-base! font-semibold! lg:h-16! lg:min-w-40! xl:h-20! xl:min-w-48! xl:text-lg!"
                            >
                                Rejestracja
                            </Button>
                            <Button
                                href={login.url()}
                                type="ghost"
                                className="h-14! min-w-32! rounded-lg! text-base! font-semibold! lg:h-16! lg:min-w-36! xl:h-20! xl:min-w-42! xl:text-lg!"
                            >
                                Logowanie
                            </Button>
                        </div>
                    </div>

                    <div
                        className={clsx(
                            styles.welcomeImage,
                            'relative hidden h-full overflow-hidden rounded-[1.25rem] border border-border bg-cover bg-center md:block xl:rounded-3xl',
                        )}
                    />

                    <div className="flex w-full max-w-142 flex-col items-center md:hidden">
                        <img
                            src="/icons/homind-logo.svg"
                            className="mb-12 w-52 max-w-full"
                            alt="Homind"
                        />

                        <div className="w-full rounded-3xl bg-background px-6 pt-7 pb-9 text-center shadow-[0_1rem_2.5rem_rgba(36,39,40,0.18)]">
                            <h1 className="mb-8 text-[1.75rem] leading-tight font-bold text-foreground">
                                Zewnętrzna pamięć Twojego&nbsp;domu.
                            </h1>
                            <p className="mx-auto mt-4 max-w-100 text-[1.0625rem] leading-relaxed text-neutral">
                                Uporządkowana przestrzeń do&nbsp;zarządzania
                                domem. Planuj zadania, kontroluj rzeczy
                                i&nbsp;dbaj o&nbsp;dom z&nbsp;lekką prostotą.
                            </p>

                            <div className="mt-7 flex flex-col gap-4">
                                <Button
                                    href={register.url()}
                                    type="primary"
                                    className="h-16! w-full rounded-lg! text-base! font-semibold!"
                                >
                                    Rejestracja
                                </Button>
                                <Button
                                    href={login.url()}
                                    type="ghost"
                                    className="h-16! w-full rounded-lg! text-base! font-semibold!"
                                >
                                    Logowanie
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
