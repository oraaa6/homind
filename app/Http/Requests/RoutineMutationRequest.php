<?php

namespace App\Http\Requests;

use App\Models\Routine;
use Illuminate\Foundation\Http\FormRequest;

class RoutineMutationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $routine = $this->route('routine');

        return $routine instanceof Routine && $this->user()?->can('update', $routine);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return ['version' => ['required', 'integer', 'min:1']];
    }
}
