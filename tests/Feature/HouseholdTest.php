<?php

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Gate;

test('household members share access to their household', function () {
    $household = Household::factory()->hasAttached(User::factory()->count(2))->create();

    expect($household->users)->toHaveCount(2);

    foreach ($household->users as $user) {
        expect($user->households->modelKeys())->toBe([$household->id]);
        expect($user->can('view', $household))->toBeTrue();
    }
});

test('members cannot access another household', function () {
    $first = Household::factory()->hasAttached(User::factory()->count(2))->create();
    $second = Household::factory()->hasAttached(User::factory()->count(2))->create();

    foreach ($first->users as $user) {
        expect($user->can('view', $first))->toBeTrue();
        expect($user->can('view', $second))->toBeFalse();
    }

    foreach ($second->users as $user) {
        expect($user->can('view', $second))->toBeTrue();
        expect($user->can('view', $first))->toBeFalse();
    }
});

test('a user can belong to multiple households', function () {
    $user = User::factory()->create();
    $households = Household::factory()->count(2)->hasAttached($user)->create();

    expect($user->households)->toHaveCount(2);

    foreach ($households as $household) {
        expect($user->can('view', $household))->toBeTrue();
    }
});

test('guests and users without membership cannot access a household', function () {
    $household = Household::factory()->hasAttached(User::factory())->create();
    $outsider = User::factory()->create();

    expect(Gate::forUser(null)->allows('view', $household))->toBeFalse();
    expect($outsider->can('view', $household))->toBeFalse();
});

test('removing membership immediately revokes access', function () {
    $user = User::factory()->create();
    $household = Household::factory()->hasAttached($user)->create();

    $user->load('households');

    expect($user->can('view', $household))->toBeTrue();

    $household->users()->detach($user);

    expect($user->can('view', $household))->toBeFalse();
});

test('a user cannot be added to the same household twice', function () {
    $user = User::factory()->create();
    $household = Household::factory()->hasAttached($user)->create();

    expect(fn () => $household->users()->attach($user))
        ->toThrow(UniqueConstraintViolationException::class);
});

test('deleting a household removes memberships without deleting users or other households', function () {
    $user = User::factory()->create();
    $household = Household::factory()->hasAttached($user)->create();
    $other = Household::factory()->hasAttached($user)->create();

    $household->delete();

    $this->assertDatabaseMissing('household_user', ['household_id' => $household->id]);
    $this->assertDatabaseHas('users', ['id' => $user->id]);

    expect($user->can('view', $other))->toBeTrue();
});
