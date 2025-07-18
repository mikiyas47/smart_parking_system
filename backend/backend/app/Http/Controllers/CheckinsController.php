<?php

namespace App\Http\Controllers;
use App\Models\ParkingSlot;
use App\Models\CheckIn; 
use App\Models\Car;
use App\Models\User;
use App\Models\Slot;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

use Carbon\Carbon;
        
class CheckinsController extends Controller
{
    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,plate_number',
            'slot_id' => 'required|exists:slots,id'
        ]);

        try {
            DB::beginTransaction();
    
            // Find the slot
            $slot = Slot::findOrFail($validated['slot_id']);
            
            // Check if slot is available and not already checked in
            if ($slot->status === 'occupied') {
                return response()->json([
                    'message' => 'This slot is occupied.',
                ], 400);
            }
            
            // Create check-in record
            $checkIn = CheckIn::create([
                'car_id' => $validated['car_id'],
                'slot_id' => $slot->id,
                'check_in_time' => Carbon::now(),
                'has_check_in' => true
            ]);
            $slot->update(['status' => 'occupied']);
    
            DB::commit();
    
            return response()->json([
                'message' => 'Check-in successful',
                'check_in' => $checkIn,
                'check_in_time' => $checkIn->check_in_time->toDateTimeString()
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Check-in failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    
    public function checkOut(Request $request): JsonResponse
{
    $validated = $request->validate([
        'slot_id' => 'required|exists:slots,id',
    ]);

    try {
        DB::beginTransaction();

        // 1. Get the slot
        $slot = Slot::findOrFail($validated['slot_id']);

        // 2. Find active check-in record for this slot (not yet checked out)
        $checkIn = CheckIn::where('slot_id', $slot->id)
                          ->whereNull('check_out_time')
                          ->orderBy('check_in_time', 'desc')
                          ->firstOrFail();

        // 3. Update check-out time
        $checkIn->check_out_time = Carbon::now();
        $checkIn->save();

        // 4. Mark the slot as free
        $slot->update(['status' => 'free']);

        DB::commit();

        return response()->json([
            'message' => 'Check-out successful',
            'check_in' => $checkIn,
            'check_out_time' => $checkIn->check_out_time->toDateTimeString(),
            'check_in_id' => $checkIn->id,
            'slot_number' => $slot->slot_number, // ✅ Added this line
        ]);
    } catch (\Exception $e) {
        DB::rollBack();

        if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'message' => 'Check-in record not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Check-out failed',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    
    /**
     * Check if a car with the given plate number is already checked in
     * Used to prevent a car from checking in twice without checking out first
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function findcar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plate_number' => 'required|exists:check_ins,car_id',
        ]);
        
        $car = CheckIn::where('car_id', $validated['plate_number'])
                        ->where('check_out_time', null)
                        ->get();
        
        if (!$car->isEmpty()) {
            return response()->json([
                'message' => 'Car found',
                'data' => $car
            ]);
        } else {
            return response()->json(['message' => 'Car not found'], 404);
        }
    }
    
    

    /**
     * Generate a report for an agent within a date range
     * Includes data for all parking areas managed by the agent
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function reportByDate(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date'   => 'required|date_format:Y-m-d|after_or_equal:start_date',
            'UserEmail'  => 'required|exists:users,email'
        ]);
    
        // Get agent from email
        $agentEmail = $request->UserEmail;
        $agent = User::where('email', $agentEmail)->first();
    
        if (!$agent) {
            return response()->json([
                'message' => 'Agent not found.',
                'agent_id' => $agentEmail
            ], 404);
        }
        $agentId = $agent->id;
        $start = Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay();
        $end   = Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay();
        $parkingAreas = ParkingSlot::where('agent_id', $agentId)->get();
    
        if ($parkingAreas->isEmpty()) {
            return response()->json([
                'message' => 'No parking areas found for this agent.',
                'agent_id' => $agentEmail,
                'period' => [
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                ],
                'overall_stats' => null,
                'parking_areas' => []
            ]);
        }
        $overallStats = [
            'total_parking_areas' => $parkingAreas->count(),
            'total_slots' => 0,
            'available_slots' => 0,
            'occupied_slots' => 0,
            'total_check_ins' => 0,
            'completed_check_outs' => 0,
            'currently_parked' => 0,
            'revenue_potential' => 0
        ];
        $parkingAreaDetails = [];
        foreach ($parkingAreas as $parkingArea) {
            $slots = Slot::where('parking_slot_id', $parkingArea->id)->get();
            if ($slots->isEmpty()) {
                $parkingAreaDetails[] = [
                    'id' => $parkingArea->id,
                    'location_name' => $parkingArea->location_name,
                    'city' => $parkingArea->city,
                    'sub_city' => $parkingArea->sub_city,
                    'woreda' => $parkingArea->woreda,
                    'stats' => [
                        'total_slots' => 0,
                        'available_slots' => 0,
                        'occupied_slots' => 0,
                        'check_ins_during_period' => 0,
                        'completed_check_outs' => 0,
                        'currently_parked' => 0
                    ],
                    'check_ins' => []
                ];
                continue;
            }
            $slotIds = $slots->pluck('id')->toArray();
            $checkIns = CheckIn::with(['car', 'slot'])
                ->whereBetween('check_in_time', [$start, $end])
                ->whereIn('slot_id', $slotIds)
                ->get();
            $totalSlots = $slots->count();
            $availableSlots = $slots->where('status', 'free')->count();
            $occupiedSlots = $slots->where('status', 'occupied')->count();
            $checkInsCount = $checkIns->count();
            $checkOuts = $checkIns->whereNotNull('check_out_time')->count();
            $currentlyParked = $checkInsCount - $checkOuts;
            $overallStats['total_slots'] += $totalSlots;
            $overallStats['available_slots'] += $availableSlots;
            $overallStats['occupied_slots'] += $occupiedSlots;
            $overallStats['total_check_ins'] += $checkInsCount;
            $overallStats['completed_check_outs'] += $checkOuts;
            $overallStats['currently_parked'] += $currentlyParked;
            $formattedCheckIns = $checkIns->map(function ($checkIn) {
                $slot = $checkIn->slot;
                return [
                    'id' => $checkIn->id,
                    'car_plate' => $checkIn->car_id,
                    'slot_number' => $slot ? $slot->slot_number : 'Unknown',
                    'check_in_time' => $checkIn->check_in_time->format('Y-m-d H:i:s'),
                    'check_out_time' => $checkIn->check_out_time ? $checkIn->check_out_time->format('Y-m-d H:i:s') : null,
                    'duration' => $checkIn->check_out_time ?
                        $checkIn->check_in_time->diffForHumans($checkIn->check_out_time, true) :
                        now()->diffForHumans($checkIn->check_in_time, true),
                    'status' => $checkIn->check_out_time ? 'checked_out' : 'parked'
                ];
            });
            $parkingAreaDetails[] = [
                'id' => $parkingArea->id,
                'location_name' => $parkingArea->location_name,
                'city' => $parkingArea->city,
                'sub_city' => $parkingArea->sub_city,
                'woreda' => $parkingArea->woreda,
                'stats' => [
                    'total_slots' => $totalSlots,
                    'available_slots' => $availableSlots,
                    'occupied_slots' => $occupiedSlots,
                    'check_ins_during_period' => $checkInsCount,
                    'completed_check_outs' => $checkOuts,
                    'currently_parked' => $currentlyParked
                ],
                'check_ins' => $formattedCheckIns
            ];
        }
    
        return response()->json([
            'message' => 'Report generated successfully.',
            'agent_id' => $agentEmail,
            'period' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ],
            'overall_stats' => $overallStats,
            'parking_areas' => $parkingAreaDetails
        ]);
    }
    


    public function todayCheckIns(Request $request)
    {
        $request->validate([
            'UserEmail' => 'required|exists:users,email'
        ]);
    
        // Find the agent by email
        $agent = User::where('email', $request->UserEmail)->firstOrFail();
    
        /**This line queries the parking_slots table to find all parking slots assigned to a specific agent
         *  (based on their agent_id), and then extracts only their ids using pluck('id'). Then: stores $parkingSlots  = [1, 2];
         * his line queries the slots table to find all individual slots (e.g., A1, A2, A3...) that belong
         *  to the parking slot IDs from the previous step ($parkingSlots), and then extracts only their ids. 
         * $slotIds = [10, 11, 12];
Agent
 └── ParkingSlot (id: 1, 2)
      └── Slot (id: 10, 11, 12)
*/
        $parkingSlots = ParkingSlot::where('agent_id', $agent->id)->pluck('id');
    
        // Get all individual slots from these parking slots
        $slotIds = Slot::whereIn('parking_slot_id', $parkingSlots)->pluck('id');
    
        // Count today’s check-ins for those slots
        $todayCheckIns = CheckIn::whereIn('slot_id', $slotIds)
                                ->where('has_check_in', true)
                                ->whereDate('check_in_time', Carbon::today())
                                ->count();
    
        return response()->json([
            'message' => 'Today check-ins retrieved successfully.',
            'check_ins' => $todayCheckIns,
        ]);
    }
    
//  public function reportByDate(Request $request): JsonResponse
// {
//     // Validate input dates and agent ID
//     $request->validate([
//         'start_date' => 'required|date_format:Y-m-d',
//         'end_date'   => 'required|date_format:Y-m-d|after_or_equal:start_date',
//         'agent_id'   => 'required|exists:users,id'
//     ]);
    
//     $agentId = $request->agent_id;
    
//     // Find the agent's parking slot
//     $parkingSlot = ParkingSlot::where('agent_id', $agentId)->firstOrFail();
//     $parkingSlotId = $parkingSlot->id;
    
//     // Get all slots associated with this parking slot
//     $slots = Slot::where('parking_slot_id', $parkingSlotId)->get();
    
//     if ($slots->isEmpty()) {
//         return response()->json([
//             'message' => 'No slots found for this agent.',
//             'check_ins' => []
//         ]);
//     }
    
//     $slotIds = $slots->pluck('id')->toArray();
    
//     // Convert to Carbon date objects with full day ranges
//     $start = Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay();
//     $end   = Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay();

//     // Query check-ins within date range for all slots belonging to this agent
//     $checkIns = CheckIn::with(['car', 'slot'])
//         ->whereBetween('check_in_time', [$start, $end])
//         ->whereIn('slot_id', $slotIds)
//         ->get();

//     $totalCheckIns = $checkIns->count();
//     $checkedOut = $checkIns->whereNotNull('check_out_time')->count();
//     $stillParked = $totalCheckIns - $checkedOut;

//     return response()->json([
//         'message' => 'Report generated successfully.',
//         'agent_id' => $agentId,
//         'location' => $parkingSlot->location_name,
//         'city' => $parkingSlot->city,
//         'start_date' => $start->toDateString(),
//         'end_date' => $end->toDateString(),
//         'total_check_ins' => $totalCheckIns,
//         'completed_check_outs' => $checkedOut,
//         'currently_parked' => $stillParked,
//         'details' => $checkIns
//     ]);
// } 

}
