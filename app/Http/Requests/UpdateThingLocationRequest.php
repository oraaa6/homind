<?php

namespace App\Http\Requests;

use App\Models\Thing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateThingLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        $element = (string) $this->route('element');
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $this->user()->households()->select('households.id'),
            ))
            ->with('place')
            ->findOrFail($element);

        return [
            'place_id' => [
                'required',
                'integer',
                Rule::exists('places', 'id')->where('household_id', $thing->place->household_id),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'place_id.required' => 'Wybierz nową lokalizację.',
            'place_id.integer' => 'Wybrana lokalizacja jest nieprawidłowa.',
            'place_id.exists' => 'Wybierz lokalizację z tego samego domu co przedmiot.',
        ];
    }
}
