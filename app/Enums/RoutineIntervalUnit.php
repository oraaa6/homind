<?php

namespace App\Enums;

enum RoutineIntervalUnit: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
    case Year = 'year';
}
