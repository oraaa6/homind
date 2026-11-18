<?php

namespace App\Http\Requests;

use App\Models\Routine;

class UpdateRoutineRequest extends StoreRoutineRequest
{
    public function authorize(): bool
    {
        $routine = $this->route('routine');

        return $routine instanceof Routine && $this->user()?->can('update', $routine);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'lastCompletedAt' => ['prohibited'],
            'nextDueAt' => ['required', 'date_format:Y-m-d'],
            'version' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @return array{starts_at: string, next_due_at: string}
     */
    protected function scheduleDates(array $data, array $schedule): array
    {
        return ['starts_at' => $data['startsAt'], 'next_due_at' => $data['nextDueAt']];
    }
}
