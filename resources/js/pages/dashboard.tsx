import { FireOutlined, ToolOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';

const tasks = [
    {
        title: 'Filtr wody',
        meta: 'Wymiana co 90 dni, minęło 87 dni',
        icon: <FireOutlined />,
        tone: 'bg-[#ffd8d6] text-[#b7483f]',
        action: 'Zrobione',
        done: true,
        progress: 87,
    },
    {
        title: 'Przegląd piecyka',
        meta: 'Za 12 dni',
        icon: <ToolOutlined />,
        tone: 'bg-[#e6e4df] text-secondary',
        action: 'Szczegóły',
        done: false,
    },
];

const stats = [
    { value: '428', label: 'PRZEDMIOTÓW' },
    { value: '37', label: 'LOKALIZACJI', dot: true },
    { value: '14', label: 'SPRZĘTÓW' },
    { value: '8', label: 'AKTYWNYCH RUTYN', dot: true },
    { value: '2', label: 'SAMOCHODY' },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            {/* <section className="mb-20">
                <h1 className="mb-5 text-heading-2">
                    Dzień dobry, Ola <span aria-hidden="true">👋</span>
                </h1>
                <p className="text-secondary text-2xl font-medium">
                    Twój dom ma dziś 4 rzeczy do ogarnięcia.
                </p>
            </section> */}

            {/* <section className="mb-20">
                <div className="mb-10 flex items-center gap-3">
                    <CheckCircleOutlined className="text-primary text-3xl" />
                    <h2 className="text-heading-3">DO OGARNIĘCIA</h2>
                </div>

                <div className="grid gap-8 xl:grid-cols-2">
                    {tasks.map((task) => (
                        <Card
                            key={task.title}
                            className="border-neutral/30 rounded-lg shadow-sm"
                            styles={{ body: { padding: 28 } }}
                        >
                            <div className="flex items-center gap-6">
                                <div
                                    className={`flex size-[72px] shrink-0 items-center justify-center rounded-lg text-3xl ${task.tone}`}
                                >
                                    {task.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-foreground mb-2 text-xl font-bold">
                                        {task.title}
                                    </h3>
                                    <p className="mb-2 font-bold text-[#ad5a50]">
                                        <span className="mr-3 inline-block size-3 rounded-full bg-[#ad5a50]" />
                                        {task.meta}
                                    </p>
                                    {task.progress && (
                                        <Progress
                                            percent={task.progress}
                                            showInfo={false}
                                            strokeColor="#ad5a50"
                                            trailColor="#eee9e2"
                                            size={['100%', 8]}
                                        />
                                    )}
                                </div>
                                <Button
                                    type={task.done ? 'primary' : 'default'}
                                    ghost={!task.done}
                                    size="large"
                                    className="min-w-28"
                                >
                                    {task.action}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section> */}

            {/* <section>
                <div className="mb-10 flex items-center gap-3">
                    <BarChartOutlined className="text-primary text-3xl" />
                    <h2 className="text-heading-3">DOM W LICZBACH</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-neutral/30 relative rounded-lg text-center shadow-sm"
                            styles={{ body: { padding: '30px 20px' } }}
                        >
                            {stat.dot && (
                                <span className="absolute top-5 right-5 size-3 rounded-full bg-[#ad5a50]" />
                            )}
                            <div className="text-primary mb-4 text-6xl leading-none font-bold">
                                {stat.value}
                            </div>
                            <div className="text-secondary font-bold tracking-wide">
                                {stat.label}
                            </div>
                        </Card>
                    ))}
                </div>
            </section> */}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
