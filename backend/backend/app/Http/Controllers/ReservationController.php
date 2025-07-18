<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Reservation;
use App\Models\Car;
use App\Models\Slot;
use App\Models\CheckIn;
use App\Models\ParkingSlot;
use App\Models\User;


class ReservationController extends Controller
{
    public function makeReservation(Request $request)
{
    try {
        $validated = $request->validate([
            'plate_number' => 'required|string',
            'slot_id' => 'required|exists:slots,id',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'errors' => $e->errors(),
            'message' => 'Validation failed'
        ], 422);
    }

    $plateNumber = $validated['plate_number'];
    $slotId = $validated['slot_id'];

    // Check if the car is registered in the database
    $carExists = Car::where('plate_number', $plateNumber)->exists();
    if (!$carExists) {
        return response()->json(['message' => 'Car not registered in the database.'], 400);
    }

    // Check if the car is already checked in (no check out yet)
    $isCheckedIn = CheckIn::where('car_id', $plateNumber)
        ->whereNull('check_out_time')
        ->exists();

    if ($isCheckedIn) {
        return response()->json(['message' => 'Car is already checked in. Please check out before making a new reservation.'], 400);
    }

    // Check for existing active reservation
    $hasReservation = Reservation::where('plate_number', $plateNumber)
        ->where('status', 'active')
        ->exists();

    if ($hasReservation) {
        return response()->json(['message' => 'An active reservation already exists for this car.'], 400);
    }

    // Load slot and verify it's free
    $slot = Slot::find($slotId);
    if (!$slot || $slot->status !== 'free') {
        return response()->json(['message' => 'Selected slot is not available.'], 400);
    }

    // Check if the parking area (parent) is available
    $parkingSlot = ParkingSlot::find($slot->parking_slot_id);
    if (!$parkingSlot || $parkingSlot->status !== 'available') {
        return response()->json(['message' => 'The parking area is currently unavailable.'], 400);
    }

    // Reserve the slot
    $reservation = Reservation::create([
        'plate_number' => $plateNumber,
        'slot_id' => $slotId,
        'status' => 'active',
        'reserved_at' => now(),
        'expires_at' => now()->addMinutes(5),
    ]);

    // Update slot status to reserved
    $slot->status = 'reserved';
    $slot->save();

    return response()->json([
        'message' => 'Reservation created successfully.',
        'reservation' => $reservation,
        'slot_number'=>$slot->slot_number,
        'slot' => $slot,
    ], 201);
}

     
    //manual cancile reservation via plate number 
    public function cancelReservationByPlateNumber(Request $request)
{
    $request->validate([
        'plate_number' => 'required|string',
    ]);

    $plateNumber = $request->input('plate_number');

    // Explicitly check if car is registered
    $carExists = Car::where('plate_number', $plateNumber)->exists();

    if (!$carExists) {
        return response()->json(['message' => 'Car is not registered in the system.'], 404);
    }

    // Find active reservation(s) for the plate number
    $reservations = Reservation::where('plate_number', $plateNumber)
        ->where('status', 'active')
        ->get();

    if ($reservations->isEmpty()) {
        return response()->json(['message' => 'No active reservation found for this car.'], 404);
    }

    foreach ($reservations as $reservation) {
        $reservation->status = 'cancelled';
        $reservation->save();

        // Update the related slot
        $slot = Slot::find($reservation->slot_id);
        if ($slot) {
            // Check if other active reservations exist for this slot
            $otherActiveReservations = Reservation::where('slot_id', $slot->id)
                ->where('status', 'active')
                ->exists();

            if (!$otherActiveReservations) {
                $slot->status = 'free';
                $slot->save();
            }
        }
    }

    return response()->json([
        'message' => 'Reservation(s) cancelled successfully for plate number: ' . $plateNumber,
        'slot_info'=>$slot->only(['slot_number']),
        'count' => $reservations->count()
    ]);
}




public function getActiveReservationsByAgent(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
    ]);

    $email = $request->email;

    // Get agent
    $agent = DB::table('users')->where('email', $email)->where('role', 'agent')->first();
    if (!$agent) {
        return response()->json(['message' => 'Agent not found or invalid role'], 404);
    }

    // Get all parking slot IDs for the agent
    $parkingSlotIds = DB::table('parking_slots')
        ->where('agent_id', $agent->id)
        ->pluck('id');

    // Get all slot IDs under those parking slots
    $slotIds = DB::table('slots')
        ->whereIn('parking_slot_id', $parkingSlotIds)
        ->pluck('id');

    // Get all active reservations for those slots
    $reservations = DB::table('reservations')
        ->join('slots', 'reservations.slot_id', '=', 'slots.id')
        ->join('parking_slots', 'slots.parking_slot_id', '=', 'parking_slots.id')
        ->where('reservations.status', 'active')
        ->whereIn('reservations.slot_id', $slotIds)
        ->select(
            'reservations.*',
            'slots.slot_number',
            'slots.status as slot_status',
            'parking_slots.city',
            'parking_slots.sub_city',
            'parking_slots.woreda',
            'parking_slots.location_name'
        )
        ->get();

    return response()->json([
        'agent' => [
            'name' => $agent->name,
            'email' => $agent->email,
        ],
        'reservations' => $reservations,
        'parkingSlotIds'=>$parkingSlotIds,
        'slotIds'=>$slotIds
    ]);
}



public function checkInByReservation(Request $request)
{
    $request->validate([
        'plate_number' => 'required|string',
        'email' => 'required|email|exists:users,email'
    ]);

    // ✅ 1. Check if user is a valid agent
    $user = DB::table('users')
        ->where('email', $request->email)
        ->where('role', 'agent')
        ->where('status', 'active')
        ->first();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized or inactive agent'], 403);
    }

    // ✅ 2. Get valid reservation for this car
    $reservation = DB::table('reservations')
        ->where('plate_number', $request->plate_number)
        ->where('status', 'active')
        ->where('expires_at', '>',now())
        ->first();

    if (!$reservation) {
        return response()->json(['message' => 'No valid active reservation found.'], 404);
    }

    // ✅ 3. Get the slot for the reservation
    $slot = DB::table('slots')->where('id', $reservation->slot_id)->first();

    if (!$slot || $slot->status !== 'reserved') {
        return response()->json(['message' => 'Slot is not reserved or doesn’t exist.'], 400);
    }

    // ✅ 4. Check if car is already checked in
    $alreadyCheckedIn = DB::table('check_ins')
        ->where('car_id', $request->plate_number)
        ->whereNull('check_out_time')
        ->exists();

    if ($alreadyCheckedIn) {
        return response()->json(['message' => 'This car is already checked in.'], 400);
    }

    // ✅ 5. Insert new check-in
    $checkInId = DB::table('check_ins')->insertGetId([
        'car_id' => $request->plate_number,
        'slot_id' => $reservation->slot_id,
        'check_in_time' => Carbon::now(),
        'has_check_in' => true,
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now(),
    ]);

    // ✅ 6. Update reservation status to checked_in
    DB::table('reservations')
        ->where('id', $reservation->id)
        ->update(['status' => 'checked_in']);

    // ✅ 7. Update slot status to occupied
    DB::table('slots')
        ->where('id', $slot->id)
        ->update(['status' => 'occupied']);

    // ✅ 8. Return response
    return response()->json([
        'message' => 'Car checked in successfully.',
        'check_in_id' => $checkInId,
        'slot_id' => $slot->id,
        'reservation_id' => $reservation->id
    ], 201);
}

public function reservationReport(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    // 1. Verify agent
    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized or inactive agent'], 403);
    }

    // 2. Get agent's parking slots
    $parkingSlots = ParkingSlot::where('agent_id', $user->id)->get();

    if ($parkingSlots->isEmpty()) {
        return response()->json(['message' => 'No parking slots found for this agent.'], 404);
    }

    // 3. Prepare report data
    $report = [];

    foreach ($parkingSlots as $parkingSlot) {
        // Get all slot IDs under this parking slot
        $slotIds = Slot::where('parking_slot_id', $parkingSlot->id)->pluck('id');

        // Filter reservations in date range
        $reservations = Reservation::whereIn('slot_id', $slotIds)
            ->whereBetween('reserved_at', [$request->start_date, $request->end_date])
            ->get();

        // Count by status
        $counts = [
            'total' => $reservations->count(),
            'active' => $reservations->where('status', 'active')->count(),
            'cancelled' => $reservations->where('status', 'cancelled')->count(),
            'expired' => $reservations->where('status', 'expired')->count(),
            'checked_in' => $reservations->where('status', 'checked_in')->count(),
        ];

        // Push to report
        $report[] = [
            'agent_name' => $user->name,
            'agent_email' => $user->email,
            'parking_area' => [
                'location_name' => $parkingSlot->location_name,
                'city' => $parkingSlot->city,
                'sub_city' => $parkingSlot->sub_city,
                'woreda' => $parkingSlot->woreda,
            ],
            'reservation_summary' => $counts
        ];
    }

    return response()->json(['report' => $report]);
}


}
/**use Illuminate\Support\Facades\DB;

public function getActiveReservations()
{
    $reservations = DB::table('reservations')
        ->join('slots', 'reservations.slot_id', '=', 'slots.id')
        ->join('cars', 'reservations.plate_number', '=', 'cars.plate_number')
        ->join('parking_slots', 'slots.parking_slot_id', '=', 'parking_slots.id')
        ->join('users', 'slots.agent_id', '=', 'users.id')
        ->where('reservations.status', 'active')
        ->select(
            'reservations.*',
            'cars.make as car_make',
            'cars.model as car_model',
            'cars.color as car_color',
            'slots.slot_number',
            'parking_slots.location_name',
            'parking_slots.city',
            'parking_slots.sub_city',
            'users.name as agent_name',
            'users.email as agent_email'
        )
        ->get();

    return response()->json([
        'message' => 'Active reservations retrieved successfully.',
        'data' => $reservations,
    ]);
}
 */
