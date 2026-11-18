<?php

namespace App\Http\Requests;

use App\Enums\RoutineAction;
use App\Services\RoutineSchedule;
use Illuminate\Validation\Rule;

class StoreRoutineActionRequest extends RoutineMutationRequest
{
    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'type' => ['required', Rule::enum(RoutineAction::class)->only([RoutineAction::Completed, RoutineAction::Skipped])],
            'scheduledFor' => ['required', 'date_format:Y-m-d'],
            'actionAt' => [
                'exclude_unless:type,completed',
                'required',
                'date_format:Y-m-d',
                'before_or_equal:'.app(RoutineSchedule::class)->today(),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'actionAt.required' => 'Podaj datę wykonania rutyny.',
            'actionAt.date_format' => 'Podaj prawidłową datę wykonania.',
            'actionAt.before_or_equal' => 'Data wykonania nie może przypadać w przyszłości.',
            'scheduledFor.required' => 'Brakuje planowanego terminu. Odśwież stronę.',
            'scheduledFor.date_format' => 'Nieprawidłowy planowany termin.',
            'type.enum' => 'Wybierz wykonanie lub pominięcie.',
            'notes.max' => 'Notatka może mieć maksymalnie 2000 znaków.',
        ];
    }
}
