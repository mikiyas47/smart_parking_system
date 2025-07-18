<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ParkingSlot;
use App\Models\ParkingPrice;
use Illuminate\Http\Request;
use App\Models\Slot;

class ParkingPriceController extends Controller
{
    // === RESERVATION PRICE ===
    public function setReservationAndHourlyPrice(Request $request)
    {
    // Validate input
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'parking_slot_id' => 'required|exists:parking_slots,id',
        'reservation_price' => 'required|numeric|min:0',
        'price_per_hour' => 'required|numeric|min:0'
    ]);

    // Find active agent user
    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized agent'], 403);
    }

    // Debug values
    $slot = ParkingSlot::where('id', (int)$request->parking_slot_id)->first();

    // Check if slot exists at all
    if (!$slot) {
        return response()->json(['message' => 'Area ID not found at all'], 404);
    }

    // Check if slot belongs to agent
    if ((int)$slot->agent_id !== (int)$user->id) {
        return response()->json([
            'message' => 'Area exists but does not belong to this agent',
            'slot_agent_id' => $slot->agent_id,
            'user_id' => $user->id
        ], 403);
    }

    // Check for existing price
    $existing = ParkingPrice::where('parking_slot_id', $slot->id)->first();
    if ($existing) {
        return response()->json(['message' => 'Reservation price already set. Use update.'], 400);
    }

    // Create the reservation price
    $price = ParkingPrice::create([
        'parking_slot_id' => $slot->id,
        'reservation_price' => $request->reservation_price,
        'price_per_hour' => $request->price_per_hour // Set default if your DB requires it
    ]);

    return response()->json(['message' => 'Reservation price set', 'data' => $price]);
}





public function updateReservationPrice(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'parking_slot_id' => 'required|exists:parking_slots,id',
        'reservation_price' => 'required|numeric|min:0'
    ]);

    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    if (!$user) return response()->json(['message' => 'Unauthorized agent'], 403);

    $slot = ParkingSlot::where('id', $request->parking_slot_id)
                        ->where('agent_id', $user->id)
                        ->first();

    if (!$slot) return response()->json(['message' => 'Area not found'], 404);

    $price = ParkingPrice::where('parking_slot_id', $slot->id)->first();

    if (!$price) return response()->json(['message' => 'Reservation price not set yet'], 404);

    $price->reservation_price = $request->reservation_price;
    $price->save();

    return response()->json(['message' => 'Reservation price updated', 'data' => $price]);
}



public function getReservationPrice(Request $request)
{
    $request->validate([
        'slot_id' => 'required|exists:slots,id'
    ]);

    $slot = Slot::find($request->slot_id);
    if (!$slot) return response()->json(['message' => 'Area not found'], 404);

    $parkingSlot = ParkingSlot::find($slot->parking_slot_id);
    if (!$parkingSlot) return response()->json(['message' => 'Parking slot not found'], 404);

    $price = ParkingPrice::where('parking_slot_id', $parkingSlot->id)->first();

    if (!$price || $price->reservation_price === null)
        return response()->json(['message' => 'Reservation price not set'], 404);

    return response()->json(['reservation_price' => $price->reservation_price]);
}

    // === PRICE PER HOUR ===




    public function updateHourlyPrice(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'parking_slot_id' => 'required|exists:parking_slots,id',
        'price_per_hour' => 'required|numeric|min:0'
    ]);

    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    if (!$user) return response()->json(['message' => 'Unauthorized agent'], 403);

    $slot = ParkingSlot::where('id', $request->parking_slot_id)
                        ->where('agent_id', $user->id)
                        ->first();

    if (!$slot) return response()->json(['message' => 'Area not found'], 404);

    $price = ParkingPrice::where('parking_slot_id', $slot->id)->first();

    if (!$price) return response()->json(['message' => 'Hourly price not set yet'], 404);

    $price->price_per_hour = $request->price_per_hour;
    $price->save();

    return response()->json(['message' => 'Hourly price updated', 'data' => $price]);
}





public function getHourlyPrice(Request $request)
{
    $request->validate([
        'slot_id' => 'required|exists:slots,id'
    ]);

    $slot = Slot::find($request->slot_id);
    if (!$slot) return response()->json(['message' => 'Area not found'], 404);

    $parkingSlot = ParkingSlot::find($slot->parking_slot_id);
    if (!$parkingSlot) return response()->json(['message' => 'Parking slot not found'], 404);

    $price = ParkingPrice::where('parking_slot_id', $parkingSlot->id)->first();

    if (!$price || $price->price_per_hour === null)
        return response()->json(['message' => 'Hourly price not set'], 404);

    return response()->json(['price_per_hour' => $price->price_per_hour]);
}





/**
 * Get the reservation and hourly parking price for all parking slots owned by a specific agent.
 *
 * This function accepts an agent's email (retrieved from local storage on frontend),
 * verifies the agent's identity and active status, then fetches all parking slots assigned to them.
 * For each parking slot, it fetches the associated price (reservation and hourly) if it exists.
 *
 */
public function AgentreservationAndHourlyPrice(Request $request)
{
    // 1. Validate input: ensure a valid, existing email is provided
    $request->validate([
        'email' => 'required|email|exists:users,email',
    ]);

    // 2. Retrieve the user with that email and confirm they are an active agent
    $user = User::where('email', $request->email)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->first();

    // 3. If the agent is not found or inactive, return unauthorized
    if (!$user) {
        return response()->json(['message' => 'Unauthorized agent'], 403);
    }

    // 4. Get all parking slots assigned to this agent
    $parkingSlots = ParkingSlot::where('agent_id', $user->id)->get();

    // 5. If agent has no parking slots assigned, return not found
    if ($parkingSlots->isEmpty()) {
        return response()->json(['message' => 'No parking slots found for this agent'], 404);
    }

    // 6. Initialize an array to store prices for each parking slot
    $prices = [];

    // 7. Loop through each parking slot and fetch its pricing information
    foreach ($parkingSlots as $parkingSlot) {
        $price = ParkingPrice::where('parking_slot_id', $parkingSlot->id)->first();

        // 8. If pricing info exists for this parking slot, prepare it for response
        /*Why It Doesn’t Overwrite:
$prices[] = [...] means "append a new item to the $prices array."

PHP automatically adds to the end of the array — it doesn't replace any existing item unless you give it an explicit key (like $prices[0] = ...).

So after 3 iterations, $prices looks something like:
[
    0 => [...], // First parking slot's prices
    1 => [...], // Second parking slot's prices
    2 => [...], // Third parking slot's prices
]* */
        if ($price) {
            $prices[] = [
                'parking_slot' => [
                    'location_name' => $parkingSlot->location_name,
                    'city' => $parkingSlot->city,
                    'sub_city' => $parkingSlot->sub_city,
                    'woreda' => $parkingSlot->woreda,
                ],
                'reservation_price' => $price->reservation_price,
                'price_per_hour' => $price->price_per_hour,
            ];
        }
    }

    // 9. Return the list of prices for all parking slots owned by the agent
    return response()->json($prices);
}


}

