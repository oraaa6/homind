<?php

use App\Models\Routine;
use App\Models\User;
use App\Policies\RoutinePolicy;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

test('all routine access is restricted to household membership', function (bool $member) {
    $user = Mockery::mock(User::class);
    $relation = Mockery::mock(BelongsToMany::class);
    $user->shouldReceive('households')->times(3)->andReturn($relation);
    $relation->shouldReceive('whereKey')->with(42)->times(3)->andReturnSelf();
    $relation->shouldReceive('exists')->times(3)->andReturn($member);
    $routine = new Routine;
    $routine->setRawAttributes(['household_id' => 42]);
    $policy = new RoutinePolicy;

    expect($policy->view($user, $routine))->toBe($member)
        ->and($policy->update($user, $routine))->toBe($member)
        ->and($policy->delete($user, $routine))->toBe($member);
    Mockery::close();
})->with([true, false]);
