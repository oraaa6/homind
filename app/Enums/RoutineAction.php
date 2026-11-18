<?php

namespace App\Enums;

enum RoutineAction: string
{
    case Completed = 'completed';
    case Skipped = 'skipped';
    case Paused = 'paused';
    case Resumed = 'resumed';
    case Archived = 'archived';
    case Restored = 'restored';

    public function isTerm(): bool
    {
        return $this === self::Completed || $this === self::Skipped;
    }
}
