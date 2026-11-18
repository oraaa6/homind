export enum RoutineCategory {
    Cleaning = 'cleaning',
    Hygiene = 'hygiene',
    Equipment = 'equipment',
    Garden = 'garden',
    Car = 'car',
    Pets = 'pets',
    Other = 'other',
}

export const routineCategoryLabels: Record<RoutineCategory, string> = {
    [RoutineCategory.Cleaning]: 'Porządki',
    [RoutineCategory.Hygiene]: 'Higiena',
    [RoutineCategory.Equipment]: 'Sprzęt i wyposażenie',
    [RoutineCategory.Garden]: 'Ogród i rośliny',
    [RoutineCategory.Car]: 'Samochód',
    [RoutineCategory.Pets]: 'Zwierzęta',
    [RoutineCategory.Other]: 'Inne',
};

export const routineCategoryOptions = Object.values(RoutineCategory).map(
    (value) => ({ value, label: routineCategoryLabels[value] }),
);
