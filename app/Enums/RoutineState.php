<?php

namespace App\Enums;

enum RoutineState: string
{
    case Active = 'active';
    case Paused = 'paused';
    case Archived = 'archived';
}
