<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreUserRequest;
use App\Models\User;

class UserController
{
    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    public function store(StoreUserRequest $request)
    {
        User::create($request->validated());

        return redirect()->back()->with('success', 'User created successfully!');
    }

    public function update(StoreUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        if ($user->id === request()->user()->id) {
            return redirect()->back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully!');
    }
}
