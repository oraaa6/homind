<?php

namespace App\Http\Requests;

use App\Enums\RoutineState;
use Illuminate\Validation\Rule;

class UpdateRoutineStateRequest extends RoutineMutationRequest
{
    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [...parent::rules(), 'state' => ['required', Rule::enum(RoutineState::class)]];
    }
}
