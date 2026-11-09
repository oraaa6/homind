<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $household_id
 * @property int|null $user_id
 * @property int|null $thing_id
 * @property int|null $place_id
 * @property int|null $from_place_id
 * @property int|null $to_place_id
 * @property string $event
 * @property array<string, mixed>|null $details
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'household_id',
    'user_id',
    'thing_id',
    'place_id',
    'from_place_id',
    'to_place_id',
    'event',
    'details',
])]
class ActivityLog extends Model
{
    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Thing, $this> */
    public function thing(): BelongsTo
    {
        return $this->belongsTo(Thing::class);
    }

    /** @return BelongsTo<Place, $this> */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /** @return BelongsTo<Place, $this> */
    public function fromPlace(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'from_place_id');
    }

    /** @return BelongsTo<Place, $this> */
    public function toPlace(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'to_place_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['details' => 'array'];
    }
}
