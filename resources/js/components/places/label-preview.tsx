import { HomeFilled } from '@ant-design/icons';
import { QRCode } from 'antd';
import type { Place } from '@/pages/places/data';
import { placeKinds } from './place-kinds';

export default function LabelPreview({
    identifier,
    name,
    room,
    kind,
    value,
}: {
    identifier: string;
    name: string;
    room?: string;
    kind: Place['kind'];
    value?: string;
}) {
    return (
        <div className="rounded-2xl bg-surface-muted p-3 sm:p-5">
            <div className="rounded-xl bg-(--white) p-4 text-foreground shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold">
                        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-(--white)">
                            <HomeFilled aria-hidden="true" />
                        </span>
                        HOMIND
                    </span>
                    <span className="font-mono text-xs font-semibold text-(--button-text)">
                        {placeKinds[kind].labelType}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 py-4">
                    <div data-place-label-qr className="shrink-0">
                        <QRCode
                            type="svg"
                            value={value ?? identifier}
                            size={88}
                            bordered={false}
                            color="#1b1c1a"
                            bgColor="#fff"
                            className="shrink-0"
                        />
                    </div>
                    <div
                        className="min-w-0 flex-1 basis-32 wrap-anywhere"
                    >
                        <p className="font-mono text-xl font-bold sm:text-2xl">
                            #{identifier}
                        </p>
                        <p className="mt-1 text-sm">
                            {name.trim() || 'Nazwa lokalizacji / pojemnika'}
                        </p>
                        {room && (
                            <p className="mt-1 text-xs text-(--button-text)">
                                {room}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 font-mono text-[0.625rem] text-(--button-text)">
                    <span>FORMAT: STANDARD 50x30mm</span>
                </div>
            </div>
        </div>
    );
}
