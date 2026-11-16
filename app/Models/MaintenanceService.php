<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $thing_id
 * @property string $name
 * @property Carbon|null $due_at
 * @property Carbon|null $appointment_at
 * @property int|null $recurrence_months
 * @property string|null $provider
 * @property string|null $phone
 * @property string|null $estimated_cost
 * @property string|null $notes
 * @property-read Thing $thing
 * @property-read Collection<int, MaintenanceVisit> $visits
 */
#[Fillable([
    'thing_id',
    'name',
    'due_at',
    'appointment_at',
    'recurrence_months',
    'provider',
    'phone',
    'estimated_cost',
    'notes',
])]
class MaintenanceService extends Model
{
    /** @return BelongsTo<Thing, $this> */
    public function thing(): BelongsTo
    {
        return $this->belongsTo(Thing::class);
    }

    /** @return HasMany<MaintenanceVisit, $this> */
    public function visits(): HasMany
    {
        return $this->hasMany(MaintenanceVisit::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'due_at' => 'date',
            'appointment_at' => 'datetime',
            'recurrence_months' => 'integer',
            'estimated_cost' => 'decimal:2',
        ];
    }
}
