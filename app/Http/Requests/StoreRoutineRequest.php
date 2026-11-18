<?php

namespace App\Http\Requests;

use App\Enums\RoutineCategory;
use App\Enums\RoutineIntervalUnit;
use App\Enums\RoutineScheduleType;
use App\Services\RoutineSchedule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class StoreRoutineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        $weekdays = $this->input('scheduleType') === RoutineScheduleType::Weekdays->value;

        return [
            'householdId' => ['required', 'integer', Rule::exists('household_user', 'household_id')->where('user_id', $this->user()->id)],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::enum(RoutineCategory::class)],
            'scheduleType' => ['required', Rule::enum(RoutineScheduleType::class)],
            'intervalCount' => [$weekdays ? 'nullable' : 'required', 'integer', 'min:1', 'max:1000'],
            'intervalUnit' => [$weekdays ? 'nullable' : 'required', Rule::enum(RoutineIntervalUnit::class)],
            'weekdays' => [$weekdays ? 'required' : 'present', 'array', $weekdays ? 'min:1' : 'max:0', 'max:7'],
            'weekdays.*' => ['integer', 'between:0,6', 'distinct'],
            'startsAt' => ['required', 'date_format:Y-m-d'],
            'nextDueAt' => ['prohibited'],
            'lastCompletedAt' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:'.app(RoutineSchedule::class)->today()],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'householdId.required' => 'Wybierz dom, do którego należy rutyna.',
            'householdId.exists' => 'Nie masz dostępu do wybranego domu.',
            'name.required' => 'Podaj nazwę rutyny.',
            'name.max' => 'Nazwa może mieć maksymalnie 150 znaków.',
            'category.enum' => 'Wybierz kategorię z listy.',
            'scheduleType.enum' => 'Wybierz sposób powtarzania.',
            'intervalCount.required' => 'Podaj częstotliwość.',
            'intervalCount.integer' => 'Częstotliwość musi być liczbą całkowitą.',
            'intervalCount.min' => 'Częstotliwość musi wynosić od 1 do 1000.',
            'intervalCount.max' => 'Częstotliwość musi wynosić od 1 do 1000.',
            'intervalUnit.enum' => 'Wybierz jednostkę czasu z listy.',
            'weekdays.required' => 'Wybierz przynajmniej jeden dzień tygodnia.',
            'weekdays.min' => 'Wybierz przynajmniej jeden dzień tygodnia.',
            'weekdays.max' => 'Sprawdź dni tygodnia i sposób powtarzania.',
            'weekdays.*.between' => 'Wybierz prawidłowe dni tygodnia.',
            'weekdays.*.distinct' => 'Dni tygodnia nie mogą się powtarzać.',
            'startsAt.required' => 'Wybierz pierwszy termin wykonania.',
            'startsAt.date_format' => 'Podaj prawidłową datę pierwszego wykonania.',
            'nextDueAt.prohibited' => 'Kolejny termin jest wyliczany automatycznie.',
            'nextDueAt.required' => 'Wybierz kolejny termin wykonania.',
            'nextDueAt.date_format' => 'Podaj prawidłowy kolejny termin.',
            'nextDueAt.after_or_equal' => 'Termin nie może przypadać przed początkiem harmonogramu.',
            'lastCompletedAt.date_format' => 'Podaj prawidłową datę ostatniego wykonania.',
            'lastCompletedAt.before_or_equal' => 'Data ostatniego wykonania nie może przypadać w przyszłości.',
            'notes.max' => 'Notatka może mieć maksymalnie 2000 znaków.',
        ];
    }

    /** @return array{name: string, category: string, schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>, starts_at: string, next_due_at: string, notes: ?string} */
    public function routineData(): array
    {
        $data = $this->validated();
        $weekdays = $data['scheduleType'] === RoutineScheduleType::Weekdays->value;
        $days = $weekdays ? array_map(intval(...), $data['weekdays']) : [];
        sort($days);
        $schedule = [
            'schedule_type' => $data['scheduleType'],
            'interval_count' => $weekdays ? 1 : (int) $data['intervalCount'],
            'interval_unit' => $weekdays ? RoutineIntervalUnit::Week->value : $data['intervalUnit'],
            'weekdays' => $days,
        ];

        return [
            'name' => trim($data['name']),
            'category' => $data['category'],
            ...$schedule,
            ...$this->scheduleDates($data, $schedule),
            'notes' => $data['notes'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @return array{starts_at: string, next_due_at: string}
     */
    protected function scheduleDates(array $data, array $schedule): array
    {
        try {
            return app(RoutineSchedule::class)->initialDates($schedule, $data['startsAt'], $data['lastCompletedAt'] ?? null);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['startsAt' => $exception->getMessage()]);
        }
    }
}
