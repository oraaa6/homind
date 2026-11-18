<?php

namespace App\Models;

use App\Enums\RoutineCategory;
use App\Enums\RoutineIntervalUnit;
use App\Enums\RoutineScheduleType;
use App\Enums\RoutineState;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $household_id
 * @property int|null $created_by
 * @property string $name
 * @property RoutineCategory $category
 * @property RoutineState $state
 * @property RoutineScheduleType $schedule_type
 * @property int $interval_count
 * @property RoutineIntervalUnit $interval_unit
 * @property list<int> $weekdays
 * @property Carbon $starts_at
 * @property Carbon $next_due_at
 * @property string|null $notes
 * @property int $version
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Household $household
 * @property-read Collection<int, RoutineHistoryEntry> $history
 */
#[Fillable(['name', 'category', 'state', 'schedule_type', 'interval_count', 'interval_unit', 'weekdays', 'starts_at', 'next_due_at', 'notes', 'version', 'created_by'])]
class Routine extends Model
{
    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /** @return HasMany<RoutineHistoryEntry, $this> */
    public function history(): HasMany
    {
        return $this->hasMany(RoutineHistoryEntry::class)->orderByDesc('id');
    }

    /** @return array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>} */
    public function scheduleData(): array
    {
        return [
            'schedule_type' => $this->schedule_type->value,
            'interval_count' => $this->interval_count,
            'interval_unit' => $this->interval_unit->value,
            'weekdays' => $this->weekdays,
        ];
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'household_id' => 'integer',
            'created_by' => 'integer',
            'category' => RoutineCategory::class,
            'state' => RoutineState::class,
            'schedule_type' => RoutineScheduleType::class,
            'interval_unit' => RoutineIntervalUnit::class,
            'weekdays' => 'array',
            'interval_count' => 'integer',
            'version' => 'integer',
            'starts_at' => 'date',
            'next_due_at' => 'date',
        ];
    }
}
