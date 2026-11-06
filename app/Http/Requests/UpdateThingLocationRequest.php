<?php

namespace App\Http\Requests;

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
        return [
            'place_id' => [
                'required',
                'integer',
                Rule::exists('places', 'id')->where(fn ($query) => $query->whereIn(
                    'household_id',
                    $this->user()->households()->select('households.id'),
                )),
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
            'place_id.exists' => 'Nie masz dostępu do wybranej lokalizacji.',
        ];
    }
}
