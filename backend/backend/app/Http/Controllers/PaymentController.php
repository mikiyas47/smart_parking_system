<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Slot;
use App\Models\ParkingSlot;
use App\Models\ParkingPrice;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;


class PaymentController extends Controller
{
    // 💳 Pay for Reservation
    public function payForReservation(Request $request)
    {
        $validated = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'plate_number' => 'required|exists:cars,plate_number',
        ]);

        // Resolve slot and parking area
        $slot = Slot::find($validated['slot_id']);
        if (!$slot) {
            return response()->json(['message' => 'Slot not found.'], 404);
        }
        $parkingSlotId = $slot->parking_slot_id;

        // Get price
        $price = ParkingPrice::where('parking_slot_id', $parkingSlotId)->value('reservation_price');
        if ($price === null) {
            return response()->json(['message' => 'Price not set for this parking area.'], 404);
        }

        // Create payment
        $payment = Payment::create([
            'plate_number' => $validated['plate_number'],
            'parking_slot_id' => $parkingSlotId,
            'amount' => $price,
            'payment_reason' => 'reservation',
            'paid_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Payment for reservation successful.',
            'payment' => $payment
        ], 201);
    }

    // 💳 Pay for Check-In
    public function payForCheckIn(Request $request)
    {
        $validated = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'plate_number' => 'required|exists:cars,plate_number',
            'amount' => 'required|numeric|min:0',
        ]);

        // Resolve slot and parking area
        $slot = Slot::find($validated['slot_id']);
        if (!$slot) {
            return response()->json(['message' => 'Slot not found.'], 404);
        }
        $parkingSlotId = $slot->parking_slot_id;

        // Get price
        $price = ParkingPrice::where('parking_slot_id', $parkingSlotId)->value('price_per_hour');
        if ($price === null) {
            return response()->json(['message' => 'Price not set for this parking area.'], 404);
        }

        // Create payment
        $payment = Payment::create([
            'plate_number' => $validated['plate_number'],
            'parking_slot_id' => $parkingSlotId,
            'amount' => $validated['amount'],
            'payment_reason' => 'check_in',
            'paid_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Payment for check-in successful.',
            'payment' => $payment
        ], 201);
    }
    public function paymentReport(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    // 1. Find the active agent
    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized or inactive agent'], 403);
    }

    // 2. Get parking slots managed by the agent
    $parkingSlotIds = ParkingSlot::where('agent_id', $user->id)->pluck('id');

    if ($parkingSlotIds->isEmpty()) {
        return response()->json(['message' => 'No parking slots found for this agent'], 404);
    }

    // 3. Get all payments for those slots within date range
    $payments = Payment::whereIn('parking_slot_id', $parkingSlotIds)
        ->whereBetween('paid_at', [$request->start_date, $request->end_date])
        ->get();

    // 4. Split by payment reason
    $reservationPayments = $payments->where('payment_reason', 'reservation');
    $checkInPayments = $payments->where('payment_reason', 'check_in');

    // 5. Final report
    $report = [
        'agent_name' => $user->name,
        'agent_email' => $user->email,
        'date_range' => [
            'from' => $request->start_date,
            'to' => $request->end_date,
        ],
        'summary' => [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),

            'by_reason' => [
                'reservation' => [
                    'count' => $reservationPayments->count(),
                    'total' => $reservationPayments->sum('amount'),
                ],
                'check_in' => [
                    'count' => $checkInPayments->count(),
                    'total' => $checkInPayments->sum('amount'),
                ],
            ],
        ],
    ];

    return response()->json($report);
}

}
