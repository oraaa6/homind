<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'household_id' => [
                'required',
                'integer',
                Rule::exists('households', 'id')->where(fn ($query) =>
                    $query->whereIn(
                        'id',
                        $this->user()->households()->select('households.id'),
                    )),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'required_if:kind,rack,box',
                'prohibited_if:kind,room',
                Rule::exists('places', 'id')->where(fn ($query) => $query
                    ->where('household_id', $this->input('household_id'))
                    ->where('kind', 'room')),
            ],
            'kind' => ['required', Rule::in(['room', 'rack', 'box'])],
            'name' => ['required', 'string', 'max:255'],
            'placement' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'household_id.required' => 'Wybierz dom.',
            'household_id.integer' => 'Wybrany dom jest nieprawidłowy.',
            'household_id.exists' => 'Nie masz dostępu do wybranego domu.',
            'parent_id.required_if' => 'Wybierz pomieszczenie nadrzędne.',
            'parent_id.prohibited_if' => 'Pomieszczenie nie może mieć lokalizacji nadrzędnej.',
            'parent_id.exists' => 'Wybierz pomieszczenie należące do wybranego domu.',
            'kind.required' => 'Wybierz typ lokalizacji.',
            'kind.in' => 'Wybrany typ lokalizacji jest nieprawidłowy.',
            'name.required' => 'Podaj nazwę lokalizacji lub pojemnika.',
            'name.max' => 'Nazwa może mieć maksymalnie 255 znaków.',
            'placement.max' => 'Położenie szczegółowe może mieć maksymalnie 5000 znaków.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'household_id' => 'dom',
            'parent_id' => 'pomieszczenie nadrzędne',
            'kind' => 'typ lokalizacji',
            'name' => 'nazwa',
            'placement' => 'położenie szczegółowe',
        ];
    }
}
