<?php

namespace App\Policies;

use App\Models\Household;
use App\Models\User;

class HouseholdPolicy
{
    public function view(User $user, Household $household): bool
    {
        return $user->households()->whereKey($household->getKey())->exists();
    }

    public function update(User $user, Household $household): bool
    {
        return $this->view($user, $household);
    }

    public function manageMembers(User $user, Household $household): bool
    {
        return $this->view($user, $household);
    }
}
