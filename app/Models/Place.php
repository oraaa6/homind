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
 * @property int $household_id
 * @property int|null $parent_id
 * @property string $kind
 * @property string $name
 * @property string|null $identifier
 * @property string|null $level
 * @property string|null $placement
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Household $household
 * @property-read Place|null $parent
 * @property-read Collection<int, Place> $children
 */
#[Fillable(['parent_id', 'kind', 'name', 'level', 'placement'])]
class Place extends Model
{
    protected static function booted(): void
    {
        static::created(function (self $place): void {
            if ($place->identifier !== null || $place->kind === 'room') {
                return;
            }

            $prefix = match ($place->kind) {
                'rack' => 'RACK',
                'box' => 'BOX',
                default => strtoupper($place->kind),
            };

            $place->forceFill([
                'identifier' => sprintf(
                    '%s-%06d',
                    $prefix,
                    $place->getKey(),
                ),
            ])->saveQuietly();
        });
    }

    /**
     * The household this place belongs to.
     *
     * @return BelongsTo<Household, $this>
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * The parent place, if this place is nested under another one.
     *
     * @return BelongsTo<Place, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Places nested directly under this place.
     *
     * @return HasMany<Place, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
