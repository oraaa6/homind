<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreThingRequest extends FormRequest
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
                Rule::exists('places', 'id')->where(function ($query) {
                    $query->whereIn(
                        'household_id',
                        $this->user()->households()->select('households.id'),
                    );

                    if ($this->boolean('needs_packing')) {
                        $query->where('kind', 'room');
                    }
                }),
            ],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'placement' => ['nullable', 'string', 'max:5000'],
            'quantity' => ['required', 'integer', 'min:0'],
            'unit' => [
                'required',
                'string',
                'max:50',
                Rule::in(array_keys(config('thing-units', []))),
            ],
            'needs_packing' => ['sometimes', 'boolean'],
            'requires_maintenance' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'place_id.required' => 'Wybierz lokalizację przedmiotu.',
            'place_id.integer' => 'Wybrana lokalizacja jest nieprawidłowa.',
            'place_id.exists' => $this->boolean('needs_packing')
                ? 'Aby dodać przedmiot do kolejki pakowania, wybierz pomieszczenie.'
                : 'Nie masz dostępu do wybranej lokalizacji.',
            'name.required' => 'Podaj nazwę przedmiotu.',
            'name.max' => 'Nazwa może mieć maksymalnie 255 znaków.',
            'category_id.required' => 'Wybierz kategorię.',
            'category_id.integer' => 'Wybrana kategoria jest nieprawidłowa.',
            'category_id.exists' => 'Wybrana kategoria już nie istnieje.',
            'placement.max' => 'Szczegółowe położenie może mieć maksymalnie 5000 znaków.',
            'quantity.required' => 'Podaj ilość przedmiotu.',
            'quantity.integer' => 'Ilość musi być liczbą całkowitą.',
            'quantity.min' => 'Ilość nie może być ujemna.',
            'unit.required' => 'Wybierz jednostkę.',
            'unit.in' => 'Wybierz jednostkę z listy.',
            'unit.max' => 'Jednostka może mieć maksymalnie 50 znaków.',
            'needs_packing.boolean' => 'Stan pakowania jest nieprawidłowy.',
        ];
    }
}
