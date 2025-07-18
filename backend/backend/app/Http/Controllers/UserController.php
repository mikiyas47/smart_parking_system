<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{  public function coutAgents()
    {
        $users = User::where('role', 'agent')->get();
        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }
    
    public function countAllusers()
    {
        $users = User::all();
        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }
    public function countActiveusers()
    {
        $users = User::where('status', 'active')->get();
        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }
    //get all users
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
    
   
//create a new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,agent',
            'phone' => 'required|string|max:15',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['password'] = Hash::make( $validated['password']);
        
        $user = User::create($validated);

        return response()->json(['user'=>$user,
                         'message' => 'User registered successfully',
                                ], 201);
    }
// get a single user
    public function show(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if ($user) {
            return response()->json($user);
        } else {
            return response()->json([
                'message' => 'User not found',
                'status' => 'error'
            ], 404);
        }
    }
   //update user 
     
   public function update(Request $request)
   {
       try {
           // Find user by email first
           $email = $request->email;
           $user = User::where('email', $email)->first();
   
           if (!$user) {
               return response()->json([
                   'message' => 'User not found',
                   'status' => 'error'
               ], 404);
           }
   
           // Validate input
           $validated = $request->validate([
               'name' => 'sometimes|string|max:255',
               'email' => 'sometimes|string|email|max:255',
               'password' => 'sometimes|string|min:8',
               'role' => 'sometimes|in:admin,agent',
               'phone' => 'sometimes|string|max:15',
               'status' => 'sometimes|in:active,inactive',
           ]);
   
           // Hash password if present
           if (isset($validated['password'])) {
               $validated['password'] = Hash::make($validated['password']);
           }
   
           // Update user
           $user->update($validated);
   
         
   
           return response()->json([
               'user' => $user,
               'message' => 'User updated successfully',
               'status' => 'success'
           ], 200);
   
       } catch (\Exception $e) {
           return response()->json([
               'message' => 'Error updating user: ' . $e->getMessage(),
               'status' => 'error'
           ], 500);
       }
   }
   
   

// // update a user
// public function update(Request $request, $id = null)
// {
//     try {
//         // Find the user by ID if provided, otherwise by email
//         $user = null;

//         if ($id !== null) {
//             $user = User::findOrFail($id);
//         } elseif ($request->has('email')) {
//             $user = User::where('email', $request->email)->first();

//             if (!$user) {
//                 return response()->json([
//                     'message' => 'User not found by email',
//                     'status' => 'error'
//                 ], 404);
//             }
//         } else {
//             return response()->json([
//                 'message' => 'No ID or email provided to identify user',
//                 'status' => 'error'
//             ], 400);
//         }

//         // Handle GET request: return user data only
//         if ($request->isMethod('get')) {
//             return response()->json([
//                 'user' => $user,
//                 'message' => 'User found successfully'
//             ]);
//         }

//         // Handle update for PUT or POST
//         $validated = $request->validate([
//             'name' => 'sometimes|string|max:255',
//             'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
//             'password' => 'sometimes|string|min:8',
//             'role' => 'sometimes|in:admin,agent',
//             'phone' => 'sometimes|string|max:15',
//             'status' => 'sometimes|in:active,inactive',
//         ]);

//         if (isset($validated['password'])) {
//             $validated['password'] = Hash::make($validated['password']);
//         }

//         $user->update($validated);

//         return response()->json([
//             'user' => $user,
//             'message' => 'User updated successfully',
//             'status' => 'success'
//         ], 200);

//     } catch (\Exception $e) {
//         return response()->json([
//             'message' => 'Error updating user: ' . $e->getMessage(),
//             'status' => 'error'
//         ], 500);
//     }
// }

    //search users by name using a query string.
    /*User::where('name', 'like', "%$name%")->get();
Performs a SQL LIKE query.
%$name% means:
Match any name that contains the substring $name.
So "Ali", "Khalid", "Saliha" would all match "ali".
- return response()->json($users);
Returns all matched users as JSON */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $users = User::where('name', 'like', '%' . $validated['name'] . '%')->get();

        return response()->json($users);
    }
}