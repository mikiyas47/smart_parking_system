<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session; // ✅ add this
use App\Models\User; // ✅ add this
use Illuminate\Support\Facades\Hash; // ✅ add this

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

     $user = User::where('email', $credentials['email'])->first();

        if ($user && Hash::check($credentials['password'], $user->password) && $user->status == 'active') {
            
           

            return response()->json([
                'status' => 'success',
                'user' => $user,
                'message' => 'Login successful'
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logged out']);
    }
}
