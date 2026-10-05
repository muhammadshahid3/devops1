<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|max:100',
            'role' => 'required|in:patient,doctor',
            'phone' => 'nullable|string|max:30',
            'specialization' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:2000',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // hashed by the model cast
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
        ]);

        if ($user->role === 'doctor') {
            DoctorProfile::create([
                'user_id' => $user->id,
                'specialization' => ($data['specialization'] ?? null) ?: 'General Physician',
                'education' => $data['education'] ?? null,
            ]);
        }

        return response()->json([
            'user' => $this->payload($user),
            'token' => $user->createToken('auth')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email or password is incorrect.'],
            ]);
        }

        return response()->json([
            'user' => $this->payload($user),
            'token' => $user->createToken('auth')->plainTextToken,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->payload($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function payload(User $user): User
    {
        return $user->role === 'doctor' ? $user->load('doctorProfile') : $user;
    }
}
