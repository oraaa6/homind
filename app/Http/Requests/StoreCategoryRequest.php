<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
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
            'category_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_name.required' => 'Wpisz nazwę kategorii.',
            'category_name.max' => 'Nazwa kategorii może mieć maksymalnie 100 znaków.',
            'category_name.unique' => 'Taka kategoria już istnieje.',
        ];
    }
}
