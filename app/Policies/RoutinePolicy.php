<?php

namespace App\Policies;

use App\Models\Routine;
use App\Models\User;

class RoutinePolicy
{
    public function view(User $user, Routine $routine): bool
    {
        return $user->households()->whereKey($routine->household_id)->exists();
    }

    public function update(User $user, Routine $routine): bool
    {
        return $this->view($user, $routine);
    }

    public function delete(User $user, Routine $routine): bool
    {
        return $this->view($user, $routine);
    }
}
