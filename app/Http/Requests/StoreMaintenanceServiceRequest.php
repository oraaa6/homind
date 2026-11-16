<?php

namespace App\Http\Requests;

use App\Models\Place;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaintenanceServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        $isScheduled = $this->boolean('is_scheduled');

        return [
            'thing_id' => [
                'required',
                'integer',
                Rule::exists('things', 'id')
                    ->where('requires_maintenance', true)
                    ->whereIn('place_id', Place::query()
                        ->whereIn(
                            'household_id',
                            $this->user()->households()->select('households.id'),
                        )
                        ->select('id')),
            ],
            'name' => ['required', 'string', 'max:255'],
            'is_scheduled' => ['required', 'boolean'],
            'appointment_at' => $isScheduled
                ? ['required', 'date', 'after_or_equal:today']
                : ['prohibited'],
            'due_at' => $isScheduled
                ? ['prohibited']
                : ['required', 'date', 'after_or_equal:today'],
            'recurrence' => [
                'required',
                Rule::in([
                    'none',
                    '3-months',
                    '6-months',
                    'yearly',
                    '2-years',
                    '3-years',
                ]),
            ],
            'provider' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'thing_id.required' => 'Wybierz urządzenie wymagające serwisowania.',
            'thing_id.exists' => 'Nie masz dostępu do wybranego urządzenia lub nie wymaga ono serwisowania.',
            'name.required' => 'Podaj nazwę serwisu.',
            'is_scheduled.required' => 'Określ, czy serwis jest już umówiony.',
            'appointment_at.required' => 'Podaj termin umówionej wizyty.',
            'appointment_at.after_or_equal' => 'Termin wizyty nie może być wcześniejszy niż dzisiaj.',
            'appointment_at.prohibited' => 'Dla nieumówionego serwisu podaj termin, do którego należy go umówić.',
            'due_at.required' => 'Podaj termin, do którego należy umówić serwis.',
            'due_at.after_or_equal' => 'Termin umówienia serwisu nie może być wcześniejszy niż dzisiaj.',
            'due_at.prohibited' => 'Dla umówionego serwisu podaj termin wizyty.',
            'recurrence.required' => 'Wybierz cykliczność serwisu.',
            'recurrence.in' => 'Wybierz cykliczność z listy.',
            'estimated_cost.numeric' => 'Szacowany koszt musi być liczbą.',
            'estimated_cost.min' => 'Szacowany koszt nie może być ujemny.',
            'estimated_cost.max' => 'Szacowany koszt jest zbyt wysoki.',
        ];
    }

    /** @return array<string, mixed> */
    public function serviceData(): array
    {
        $validated = $this->validated();

        return [
            'thing_id' => $validated['thing_id'],
            'name' => $validated['name'],
            'due_at' => $validated['due_at'] ?? null,
            'appointment_at' => $validated['appointment_at'] ?? null,
            'recurrence_months' => match ($validated['recurrence']) {
                '3-months' => 3,
                '6-months' => 6,
                'yearly' => 12,
                '2-years' => 24,
                '3-years' => 36,
                default => null,
            },
            'provider' => $validated['provider'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'estimated_cost' => $validated['estimated_cost'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ];
    }
}
