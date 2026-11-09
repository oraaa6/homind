import {
    AppstoreOutlined,
    HomeOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import type { Place } from '@/pages/places/types';

export const placeKinds = {
    rack: {
        label: 'Regał',
        title: 'Regał / Mebel',
        description: 'Stała półka, szafa lub regał magazynowy.',
        icon: AppstoreOutlined,
        prefix: 'RACK',
        labelType: 'REGAŁ',
    },
    box: {
        label: 'Pudełko',
        title: 'Pudełko / Pojemnik',
        description: 'Ruchomy karton, skrzynia plastikowa, organizer',
        icon: InboxOutlined,
        prefix: 'BOX',
        labelType: 'POJEMNIK',
    },
    room: {
        label: 'Pomieszczenie',
        title: 'Pomieszczenie / Strefa',
        description: 'Obszar nadrzędny, np. Garaż, Warsztat, Spiżarnia.',
        icon: HomeOutlined,
        prefix: 'LOC',
        labelType: 'STREFA',
    },
} satisfies Record<
    Place['kind'],
    {
        label: string;
        title: string;
        description: string;
        icon: typeof HomeOutlined;
        prefix: string;
        labelType: string;
    }
>;
