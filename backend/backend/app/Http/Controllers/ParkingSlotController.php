<?php
namespace App\Http\Controllers;

use App\Models\ParkingSlot;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ParkingSlotController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|exists:users,email',
            'city' => 'required|string|max:100',
            'sub_city' => 'required|string|max:100',
            'woreda' => 'required|string|max:100',
            'location_name' => 'required|string|max:100',
        ]);

       $email = $request->email;
       $user = User::where('email', $email)
                    
                    ->first();
       $agent_id=$user->id;
        $parkingSlot = ParkingSlot::create([
            'city' => $validated['city'],
            'sub_city' => $validated['sub_city'],
            'woreda' => $validated['woreda'],
            'location_name' => $validated['location_name'],
            'status' => 'available',
            'agent_id' =>$agent_id ,
        ]);

        return response()->json([
            'message' => 'Parking Area created successfully',
            'parking_slot' => $parkingSlot,
            'Agent_name'=>$user->name
        ], 201);
    }



    // get all parking locations
    public function getAllParkingSlots(Request $request)
    {
        $parkingSlots = ParkingSlot::all();
        $parkingslotnumber = $parkingSlots->count();


        if ($parkingSlots->isEmpty()) {
            return response()->json(['message' => 'No parking Areas found.'], 404);
        }

        return response()->json([
            'message' => 'Parking Areas retrieved successfully.',
            'parking_slots' => $parkingSlots,
            'parkingslotnumber'=> $parkingslotnumber
        ]);
    }


    public function getAgentParkingSlots(Request $request)
    {
        // Validate the email exists in users table
        $request->validate([
            'agent_email' => 'required|email|exists:users,email'
        ]);
    
        // Fetch the agent using the email
        $agent = User::where('email', $request->agent_email)->first();
    
        // Ensure the user is an active agent
        if (!$agent || $agent->status !== 'active' || $agent->role !== 'agent') {
            return response()->json(['message' => 'Agent is not active or not an agent.'], 403);
        }
    
        // Find parking slots associated with the agent's ID
        $parkingSlots = ParkingSlot::where('agent_id', $agent->id)->get();
    
        if ($parkingSlots->isEmpty()) {
            return response()->json(['message' => 'No parking Areas found for this agent.'], 404);
        }
    
        // Return the agent info and parking slots
        return response()->json([
            'message' => 'Parking Areas retrieved successfully.',
            'agent' => $agent->only(['name', 'email']),
            'parking_slots' => $parkingSlots
        ]);
    }
    
public function findparkingarea(Request $request)
{
    // Validate input
    $request->validate([
        'city' => 'required|string',
        'sub_city' => 'required|string',
        'woreda' => 'required|string',
        'location_name' => 'required|string',
    ]);

    // Get matching parking slots
    $parkingSlots = ParkingSlot::where('city', $request->city)
        ->where('sub_city', $request->sub_city)
        ->where('woreda', $request->woreda)
        ->where('location_name', $request->location_name)
        ->get();

    if ($parkingSlots->isEmpty()) {
        return response()->json([
            'message' => 'No parking Areas found for this area.'
        ], 404);
    }

    // Add agent info to each slot
    /**$slotsWithAgents = $parkingSlots->map(function ($slot) {
map() is a Laravel Collection method. It loops over each item in the $parkingSlots collection and transforms each one.

$slot represents a single ParkingSlot in each loop.

The result of this map() will be a new collection, stored in $slotsWithAgents.
$agent = User::find($slot->agent_id);
Each parking slot has an agent_id field.

This line finds the User (agent) that matches that agent_id using User::find(...).

If the agent_id is 7, it does: User::find(7) — which gets the agent from the users table.

return [
    'slot' => $slot,
    'agent' => $agent ? $agent->only(['name', 'email']) : null,
];
This returns a new array for each parking slot:

'slot' => $slot keeps the parking slot data.

'agent' => ... includes the agent's name and email only.

If $agent is found, it returns only their name and email.

If no agent is found ($agent is null), it just sets 'agent' => null. */
    $slotsWithAgents = $parkingSlots->map(function ($slot) {
        $agent = User::find($slot->agent_id);
        return [
            'parking Area' => $slot,
            'agent' => $agent ? $agent->only(['name', 'email']) : null,
        ];
    });

    return response()->json([
        'message' => 'Parking Area retrieved successfully.',
        'data' => $slotsWithAgents
    ]);
}

//find parkingarea for car owner using location , city, sub_city, woreda
public function findparkingareaforcarowner(Request $request)
{
    $request->validate([
        'city' => 'required|string',
        'sub_city' => 'required|string',
        'woreda' => 'required|string',
        'location_name' => 'required|string',
    ]);

    $parkingSlots = ParkingSlot::where('city', $request->city)
        ->where('sub_city', $request->sub_city)
        ->where('woreda', $request->woreda)
        ->where('location_name', $request->location_name)
        ->get();

 if ($parkingSlots->isEmpty()) {
        return response()->json(['message' => 'No parking Area found for this area.'], 404);
    }

    return response()->json([
        'message' => 'Parking Area retrieved successfully.',
        'parking_slots' => $parkingSlots
    ]);
} 














public function findparkingareausingparkingslotid(Request $request)
{
    $request->validate([
        'parking_slot_id' => 'required|exists:parking_slots,id',
    ]);

    $parkingSlots = ParkingSlot::where('id', $request->parking_slot_id)->get();

    if ($parkingSlots->isEmpty()) {
        return response()->json(['message' => 'No parking Area found for this parking slot id.'], 404);
    }
    
    $parkingSlot = $parkingSlots->first();
    $agent = User::where('id', $parkingSlot->agent_id)->first();
    
    return response()->json([
        'message' => 'Parking Area retrieved successfully.',
        'parking_slots' => $parkingSlots,
        'Agent_info'=> $agent ? ['name' => $agent->name, 'email' => $agent->email] : null,
    ]);
}
public function updateParkingSlot(Request $request)
{
    $request->validate([
        'parking_slot_id' => 'required|exists:parking_slots,id',
        'agent_email' => 'required|email|exists:users,email',
        'city' => 'required|string',
        'sub_city' => 'required|string',
        'woreda' => 'required|string',
        'location_name' => 'required|string',
        'status' => 'required|in:available,unavailable'
    ]);

    // Find agent by email
    $agent = User::where('email', $request->agent_email)->firstOrFail();

    // Validate agent's role and status
    if ($agent->status !== 'active' || $agent->role !== 'agent') {
        return response()->json(['message' => 'Agent is not active or not an agent.'], 403);
    }

    // Find the parking slot and verify ownership
    $slot = ParkingSlot::where('id', $request->parking_slot_id)
                       ->where('agent_id', $agent->id)
                       ->first();

    if (!$slot) {
        return response()->json(['message' => 'No parking Area found for this agent.'], 404);
    }

    // Update slot info
    $slot->city = $request->city;
    $slot->sub_city = $request->sub_city;
    $slot->woreda = $request->woreda;
    $slot->location_name = $request->location_name;
    $slot->status = $request->status;
    $slot->save();

    return response()->json([
        'message' => 'Parking Area updated successfully.',
        'parking_slot' => $slot
    ]);
}




public function countAvailableParkingSlots()
{
    $availableSlots = ParkingSlot::where('status', 'available')->count();

    return response()->json([
        'message' => 'Available parking slots',
        'available_parking_slots' => $availableSlots
    ]);
}
public function countTotalParkingSlots()
{
    $totalSlots = ParkingSlot::count();
    return response()->json([
        'message' => 'Total parking Area',
        'total_parking_slots' => $totalSlots
    ]);
}

   
    
}
