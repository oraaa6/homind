<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Household;
use App\Models\Place;
use App\Models\Thing;
use App\Models\User;

class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $details
     */
    public function log(
        Household $household,
        User $user,
        string $event,
        array $details = [],
        ?Thing $thing = null,
        ?Place $place = null,
        ?Place $fromPlace = null,
        ?Place $toPlace = null,
    ): ActivityLog {
        return ActivityLog::query()->create([
            'household_id' => $household->id,
            'user_id' => $user->id,
            'thing_id' => $thing?->id,
            'place_id' => $place?->id,
            'from_place_id' => $fromPlace?->id,
            'to_place_id' => $toPlace?->id,
            'event' => $event,
            'details' => $details,
        ]);
    }
}
