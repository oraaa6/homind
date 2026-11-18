<?php

namespace App\Models;

use App\Enums\RoutineAction;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $routine_id
 * @property int|null $user_id
 * @property string $author_name
 * @property RoutineAction $type
 * @property Carbon $scheduled_for
 * @property Carbon|null $active_scheduled_for
 * @property Carbon $action_at
 * @property Carbon $previous_next_due_at
 * @property string|null $notes
 * @property Carbon|null $cancelled_at
 * @property int|null $cancelled_by
 * @property string|null $cancelled_by_name
 * @property Carbon $created_at
 */
#[Fillable(['user_id', 'author_name', 'type', 'scheduled_for', 'active_scheduled_for', 'action_at', 'previous_next_due_at', 'notes', 'cancelled_at', 'cancelled_by', 'cancelled_by_name'])]
class RoutineHistoryEntry extends Model
{
    /** @return BelongsTo<Routine, $this> */
    public function routine(): BelongsTo
    {
        return $this->belongsTo(Routine::class);
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
            'routine_id' => 'integer',
            'user_id' => 'integer',
            'cancelled_by' => 'integer',
            'type' => RoutineAction::class,
            'scheduled_for' => 'date',
            'active_scheduled_for' => 'date',
            'action_at' => 'date',
            'previous_next_due_at' => 'date',
            'cancelled_at' => 'datetime',
        ];
    }
}
