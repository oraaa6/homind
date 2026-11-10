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
 * @property int $place_id
 * @property string $name
 * @property int $category_id
 * @property string|null $placement
 * @property int $quantity
 * @property string $unit
 * @property bool $needs_packing
 * @property bool $requires_maintenance
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Place $place
 * @property-read Category $category
 * @property-read Collection<int, ActivityLog> $activityLogs
 */
#[Fillable(['place_id', 'category_id', 'name', 'placement', 'quantity', 'unit', 'needs_packing', 'requires_maintenance'])]
class Thing extends Model
{
    /**
     * The category assigned to this thing.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The location where this thing is currently stored.
     *
     * @return BelongsTo<Place, $this>
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /**
     * Activity records associated with this thing.
     *
     * @return HasMany<ActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'needs_packing' => 'boolean',
            'requires_maintenance' => 'boolean',
        ];
    }
}
