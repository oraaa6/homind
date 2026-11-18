<?php

namespace App\Enums;

enum RoutineCategory: string
{
    case Cleaning = 'cleaning';
    case Hygiene = 'hygiene';
    case Equipment = 'equipment';
    case Garden = 'garden';
    case Car = 'car';
    case Pets = 'pets';
    case Other = 'other';
}
