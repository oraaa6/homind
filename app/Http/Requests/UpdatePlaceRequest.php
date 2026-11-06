<?php

namespace App\Http\Requests;

use App\Models\Place;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlaceRequest extends FormRequest
{
    private ?Place $place = null;

    public function authorize(): bool
    {
        $element = (string) $this->route('element');
        abort_unless(ctype_digit($element), 404);

        $this->place = Place::with('household')->findOrFail($element);

        return $this->place->kind !== 'room'
            && $this->user()->can('update', $this->place->household);
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        $place = $this->place ?? Place::findOrFail($this->route('element'));

        return [
            'parent_id' => [
                'required',
                'integer',
                Rule::exists('places', 'id')->where(fn ($query) => $query
                    ->where('household_id', $place->household_id)
                    ->where('kind', 'room')),
            ],
            'placement' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parent_id.required' => 'Wybierz pomieszczenie.',
            'parent_id.integer' => 'Wybrane pomieszczenie jest nieprawidłowe.',
            'parent_id.exists' => 'Wybierz pomieszczenie z tego samego domu.',
            'placement.max' => 'Położenie szczegółowe może mieć maksymalnie 5000 znaków.',
        ];
    }
}
