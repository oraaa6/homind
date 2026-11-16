<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'performed_at' => ['required', 'date', 'before_or_equal:today'],
            'actual_cost' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'performed_at.required' => 'Podaj datę wykonania serwisu.',
            'performed_at.date' => 'Podana data wykonania jest nieprawidłowa.',
            'performed_at.before_or_equal' => 'Data wykonania nie może przypadać w przyszłości.',
            'actual_cost.numeric' => 'Koszt rzeczywisty musi być liczbą.',
            'actual_cost.min' => 'Koszt rzeczywisty nie może być ujemny.',
            'actual_cost.max' => 'Koszt rzeczywisty jest zbyt wysoki.',
            'notes.max' => 'Notatka może mieć maksymalnie 10000 znaków.',
        ];
    }
}
