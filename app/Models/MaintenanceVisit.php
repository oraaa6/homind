<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $maintenance_service_id
 * @property int|null $user_id
 * @property Carbon $performed_at
 * @property string|null $actual_cost
 * @property string|null $notes
 * @property-read MaintenanceService $maintenanceService
 * @property-read User|null $user
 */
#[Fillable([
    'maintenance_service_id',
    'user_id',
    'performed_at',
    'actual_cost',
    'notes',
])]
class MaintenanceVisit extends Model
{
    /** @return BelongsTo<MaintenanceService, $this> */
    public function maintenanceService(): BelongsTo
    {
        return $this->belongsTo(MaintenanceService::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'performed_at' => 'date',
            'actual_cost' => 'decimal:2',
        ];
    }
}
