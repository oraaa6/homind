<?php

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HouseholdController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $household = DB::transaction(function () use ($request, $validated): Household {
            $household = Household::create($validated);
            $household->users()->attach($request->user());

            return $household;
        });

        return to_route('households.settings', $household);
    }

    public function editSettings(Household $household): Response
    {
        Gate::authorize('view', $household);

        $household->load('users:id,name,email');

        return Inertia::render('settings/household', [
            'household' => [
                'id' => $household->id,
                'name' => $household->name,
                'users' => $household->users->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            ],
        ]);
    }

    public function update(Request $request, Household $household): RedirectResponse
    {
        Gate::authorize('update', $household);

        $household->update($request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]));

        return to_route('households.settings', $household);
    }

    public function addMember(Request $request, Household $household): RedirectResponse
    {
        Gate::authorize('manageMembers', $household);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);
        $member = User::query()->where('email', mb_strtolower($validated['email']))->firstOrFail();

        if ($household->users()->whereKey($member->getKey())->exists()) {
            return back()->withErrors(['email' => 'Ta osoba należy już do tego domu.']);
        }

        $household->users()->attach($member);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Użytkownik został dodany do domu.']);

        return to_route('households.settings', $household);
    }
}
