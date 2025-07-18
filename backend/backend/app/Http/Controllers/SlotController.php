<?php

namespace App\Http\Controllers;
use App\Models\ParkingSlot;
use App\Models\Slot;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class SlotController extends Controller
{      
    public function getAgentSlots(Request $request)
    {
        // Step 1: Validate the request inputs
        $request->validate([
            'UserEmail' => 'required|email|exists:users,email',
            'parking_slot_id' => 'required|exists:parking_slots,id'
        ]);
    
        // Step 2: Get agent's user record
        $agentEmail = $request->UserEmail;
        $agent = User::where('email', $agentEmail)->first();
    
        if (!$agent) {
            return response()->json([
                'message' => 'Agent not found.',
            ], 404);
        }
    
        // Step 3: Get agent ID
        $agentId = $agent->id;
    
        // Step 4: Fetch slots assigned to this agent under the given parking slot
        $slots = Slot::where('parking_slot_id', $request->parking_slot_id)
                     ->where('agent_id', $agentId)
                     ->get(['id', 'slot_number', 'status', 'parking_slot_id', 'agent_id']);
   
        // Step 5: Return slots
        return response()->json([
            'message' => 'Slots retrieved successfully.',
            'slots' => $slots,
        ]);
    }
    

    
    public function registerSlot(Request $request)
    {
        $validated = $request->validate([
            'parking_slot_id'=>'required|exists:parking_slots,id',
            'slot_number' => 'required|string|unique:slots,slot_number',
            'status'      => 'sometimes|in:free,occupied',
        ]);

        $agentEmail = $request->agent_email;
        $agent = User::where('email', $agentEmail)->first();
        $agentId=$agent->id;
        $parking_slot_id= $validated ['parking_slot_id'];       

        // 1b) Create the slot
        $slot = Slot::create([
            'slot_number'      => $request->slot_number,
            'parking_slot_id'  =>  $parking_slot_id,
            'agent_id'         => $agentId,
            'status'           => $request->input('status', 'free'),
        ]);

        return response()->json([
            'message' => 'Slot registered successfully.',
            'slot'    => $slot,
        ], 201);
    }
public function getslotbyparkingslotid(Request $request)
{
    $request->validate([
        'parking_slot_id' => 'required|exists:slots,parking_slot_id',
    ]);

    // Get all slots for the given parking_slot_id
    $slots = Slot::where('parking_slot_id', $request->parking_slot_id)->get();

    // Count free and occupied slots
    $freeCount = $slots->where('status', 'free')->count();
    $occupiedCount = $slots->where('status', 'occupied')->count();

    return response()->json([
        'message' => 'Slots retrieved successfully.',
        'total' => $slots->count(),
        'free' => $freeCount,
        'occupied' => $occupiedCount,
        'slots' => $slots,
    ]);
}


    /**
     * 2) Report: count ALL slots in the database.
     */
    public function totalSlots()
    {
        $total = Slot::count();

        return response()->json([
            'message' => 'Total slots counted successfully.',
            'total'   => $total,
        ]);
    }
    //count available and un available slots in all database 
    public function availableslots(Request $request){
        $availabletotalslots=Slot::where('status','free')->count();
        $unavailabletotalslots=Slot::where('status','occupied')->count();
        return response()->json([
            'message' => 'Available slots counted successfully.',
            'available'   => $availabletotalslots,
            'unavailable'=>$unavailabletotalslots
        ]);
    }

    public function UpdateSlotStatus(Request $request)
{
    $request->validate([
        'slot_id' => 'required|exists:slots,id',
        'status'  => 'required|in:free,occupied',
        'UserEmail' => 'required|email|exists:users,email',
    ]);

    // Get agent's ID from their email
    $agent = User::where('email', $request->UserEmail)->first();

    if (!$agent || $agent->role !== 'agent') {
        return response()->json([
            'message' => 'Unauthorized: User is not an agent.',
        ], 403);
    }

    // Ensure the slot belongs to this agent
    $slot = Slot::where('id', $request->slot_id)
                ->where('agent_id', $agent->id)
                ->first();

    if (!$slot) {
        return response()->json([
            'message' => 'Slot not found for this agent.',
        ], 404);
    }

    // Update slot status
    $slot->update([
        'status' => $request->status,
    ]);

    return response()->json([
        'message' => 'Slot status updated successfully.',
        'slot'    => $slot,
    ]);
}

    
//     /**
//      * Get a specific parking area with its slots that have active check-ins (where checkout time is null)
//      * 
//      * @param Request $request
//      * @return JsonResponse
//      */
//     public function getParkingAreaWithActiveCheckIns(Request $request): JsonResponse
//     {
//         $request->validate([
//             'parking_slot_id' => 'required|exists:parking_slots,id',
//         ]);
        
//         $parkingSlotId = $request->parking_slot_id;
        
//         // Get the parking area details
//         $parkingArea = ParkingSlot::findOrFail($parkingSlotId);
        
//         // Get all slots for this parking area
//         $slots = Slot::where('parking_slot_id', $parkingSlotId)->get();
        
//         if ($slots->isEmpty()) {
//             return response()->json([
//                 'message' => 'No slots found for this parking area.',
//                 'parking_area' => $parkingArea,
//                 'active_check_ins' => [],
//             ]);
//         }
//         /**What It Does:
// $slots is assumed to be a collection of Slot models (e.g., from Slot::where(...)->get()).

// pluck('id') extracts the id field from each slot in the collection.

// ->toArray() converts the result into a plain PHP array.

// ✅ Example:
// Suppose you have the following $slots:


// $slots = collect([
//     ['id' => 1, 'slot_number' => 'A1'],
//     ['id' => 2, 'slot_number' => 'A2'],
//     ['id' => 3, 'slot_number' => 'A3'],
// ]);
// Then this line:


// $slotIds = $slots->pluck('id')->toArray();
// Will result in:


// $slotIds = [1, 2, 3]; */
//         $slotIds = $slots->pluck('id')->toArray();
        
//         // Get all active check-ins (where checkout_time is null) for these slots
//         $activeCheckIns = CheckIn::with(['car', 'slot'])
//             ->whereIn('slot_id', $slotIds)
//             ->whereNull('check_out_time')
//             ->get()
//             ->map(function ($checkIn) {
//                 $slot = $checkIn->slot;
//                 return [
//                     'check_in_id' => $checkIn->id,
//                     'slot_id' => $slot->id,
//                     'slot_number' => $slot->slot_number,
//                     'car_plate' => $checkIn->car_id,
//                     'check_in_time' => $checkIn->check_in_time->format('Y-m-d H:i:s'),
                   
//                 ];
//             });
        
//         // Group slots by status
//         $availableSlots = $slots->where('status', 'free')->count();
//         $occupiedSlots = $slots->where('status', 'occupied')->count();
        
//         return response()->json([
//             'message' => 'Parking area with active check-ins retrieved successfully.',
//             'parking_area' => [
//                 'id' => $parkingArea->id,
//                 'location_name' => $parkingArea->location_name,
//                 'city' => $parkingArea->city,
//                 'sub_city' => $parkingArea->sub_city,
//                 'woreda' => $parkingArea->woreda,
//             ],
//             'slots_summary' => [
//                 'total' => $slots->count(),
//                 'available' => $availableSlots,
//                 'occupied' => $occupiedSlots,
//             ],
//             'active_check_ins' => $activeCheckIns,
//         ]);
//     }
}
