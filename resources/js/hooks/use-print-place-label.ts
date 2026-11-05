import { message } from 'antd';
import { useCallback } from 'react';

export function usePrintPlaceLabel(identifier: string, name: string) {
    return useCallback(() => {
        const qrCode = document.querySelector<SVGSVGElement>(
            '[data-place-label-qr] svg',
        );

        if (!qrCode) {
            message.error('Nie udało się przygotować kodu QR do druku.');

            return;
        }

        const printWindow = window.open('', '_blank', 'popup,width=640,height=480');

        if (!printWindow) {
            message.error(
                'Nie udało się otworzyć etykiety do druku. Zezwól przeglądarce na otwieranie okien.',
            );

            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html lang="pl">
                <head>
                    <meta charset="utf-8">
                    <title>Etykieta QR</title>
                    <style>
                        @page { size: 50mm 30mm; margin: 0; }
                        * { box-sizing: border-box; }
                        html, body { width: 50mm; height: 30mm; margin: 0; padding: 0; }
                        body { background: #fff; color: #1b1c1a; font-family: Arial, sans-serif; }
                        main { display: flex; width: 50mm; height: 30mm; align-items: center; gap: 2mm; overflow: hidden; padding: 2mm; }
                        svg { display: block; width: 13mm; height: 13mm; flex: 0 0 13mm; }
                        .details { min-width: 0; flex: 1; }
                        .identifier { margin: 0 0 1mm; font-family: monospace; font-size: 8pt; font-weight: 700; line-height: 1.1; overflow-wrap: anywhere; }
                        .name { display: -webkit-box; margin: 0; overflow: hidden; font-size: 7pt; line-height: 1.2; overflow-wrap: anywhere; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
                    </style>
                </head>
                <body>
                    <main>
                        ${qrCode.outerHTML}
                        <div class="details">
                            <p class="identifier"></p>
                            <p class="name"></p>
                        </div>
                    </main>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.document.querySelector('.identifier')!.textContent =
            `#${identifier}`;
        printWindow.document.querySelector('.name')!.textContent = name;
        printWindow.onafterprint = () => printWindow.close();
        printWindow.focus();
        window.setTimeout(() => printWindow.print(), 250);
    }, [identifier, name]);
}
