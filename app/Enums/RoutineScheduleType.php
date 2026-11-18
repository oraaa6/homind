<?php

namespace App\Enums;

enum RoutineScheduleType: string
{
    case Interval = 'interval';
    case Weekdays = 'weekdays';
}
