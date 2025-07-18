<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CarController;
use Laravel\Sanctum\HasApiTokens;
use App\Http\Controllers\ParkingSlotController;
use App\Http\Controllers\CheckinsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SlotController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ParkingPriceController;
use App\Http\Controllers\PaymentController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/home', function () {
    return response()->json([
        'message' => 'Hello World'
    ]);
});

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API is working correctly',
        'timestamp' => now()->toDateTimeString()
    ]);
});
// User Routes
// Get all users
Route::get('/users', [UserController::class, 'index']);

// Create new user
Route::post('/users', [UserController::class, 'store']);

// Search users by name - must be before the {id} route
Route::get('/users/search', [UserController::class, 'search']);

// Get single user
Route::post('/users/find', [UserController::class, 'show']);
//get single user 

// Update user - supporting both PUT and PATCH methods
//Route::match(['put', 'patch'], '/users/update', [UserController::class, 'update']);
Route::post('/users/update', [UserController::class, 'update']);
// Alternative GET method for the update form
Route::get('/users/{id}/edit', [UserController::class, 'update']);
//count all users
Route::post('/users/count', [UserController::class, 'countAllusers']);
//count active users
Route::post('/users/active/count', [UserController::class, 'countActiveusers']);
//count agents
Route::post('/users/agents/count', [UserController::class, 'coutAgents']);







// Car Routes
Route::get('/cars/search', [CarController::class, 'search']);
Route::post('/cars', [CarController::class, 'store']);
Route::put('/cars/update', [CarController::class, 'updateByPlate']);
// Add this new route
Route::get('/cars', [CarController::class, 'index']);


// Parking Slot Routes
// Get all parking slots
Route::get('/parking-slots', [ParkingSlotController::class, 'getAllParkingSlots']);
// Create parking slot
Route::post('/parking-slots', [ParkingSlotController::class, 'store']);

// Get parking slots for a specific agent
Route::post('/parking-slots/agent', [ParkingSlotController::class, 'getAgentParkingSlots']);

// Count available parking slots
Route::get('/parking-slots/available/count', [ParkingSlotController::class, 'countAvailableParkingSlots']);

// Count total parking slots
Route::get('/parking-slots/total/count', [ParkingSlotController::class, 'countTotalParkingSlots']);

// Update a parking slot
Route::post('/parking-slots/update', [ParkingSlotController::class, 'updateParkingSlot']);

// Find parking area using location,city, sub_city, and woreda
Route::post('/parking-slots/area', [ParkingSlotController::class, 'findparkingarea']);
//find parkingarea for car owner using location , city, sub_city, woreda
Route::post('/parking-slots/area/car-owner', [ParkingSlotController::class, 'findparkingareaforcarowner']);

// Find parking area using parking slot id
Route::post('/parking-slots/area/parking-slot-id', [ParkingSlotController::class, 'findparkingareausingparkingslotid']);
 
// Check-in Routes

// Process a new check-in
Route::post('/check-ins', [CheckinsController::class, 'checkIn']);

// Process a check-out
Route::post('/check-outs', [CheckinsController::class, 'checkOut']);
//Get today check-in
Route::post('/today/check-ins', [CheckinsController::class, 'todayCheckIns']);
// Get agent report for slots
Route::post('/agent/slots/report', [CheckinsController::class, 'reportByDate']);
// get car in the checkintable  
Route::post('/cars/in-checkins', [CheckinsController::class, 'findcar']);




// //Get check-in with checkout null
// Route::post('/check-ins/checkout-null', [CheckinsController::class, 'listchekinwithcheckoutnull']);

// // Update check-ins with null checkout time
// Route::post('/check-ins/update-checkout', [CheckinsController::class, 'updateCheckoutTime']);

// Authentication Routes

// Login route
Route::post('/login', [AuthController::class, 'login']);

// Logout route
Route::post('/logout', [AuthController::class, 'logout']);


// Slot Routes

// Get all slots for the current agent
Route::post('/agent/slots', [SlotController::class, 'getAgentSlots']);

// Register a new slot
Route::post('/slots', [SlotController::class, 'registerSlot']);

// Get total number of slots
Route::get('/slots/total', [SlotController::class, 'totalSlots']);
// update slot status
Route::post('/slots/update-status', [SlotController::class, 'UpdateSlotStatus']);
//get slot by parking slot id
Route::post('/slots/parking-slot-id', [SlotController::class, 'getslotbyparkingslotid']);
// count available and un available slots in all database
Route::post('/slots/available/count', [SlotController::class, 'availableslots']);


// Reservation route 
// makereservation 
Route::post('/reservations/make', [ReservationController::class, 'makeReservation']);
// manual cancle  reservation 
Route::post('/reservations/cancel', [ReservationController::class, 'cancelReservationByPlateNumber']);
// report on reservation 
Route::post('/reservations/agent-report', [ReservationController::class, 'getAgentReservationReport']);
//get active reservation 
Route::post('/reservations/agent/active', [ReservationController::class, 'getActiveReservationsByAgent']);
// chekin reservation
Route::post('/check-in/from-reservation', [ReservationController::class, 'checkInByReservation']);
//reservation report
Route::post('/reservations/report', [ReservationController::class, 'reservationReport']);



// price 
Route::post('/prices/reservationAndHourly/set', [ParkingPriceController::class, 'setReservationAndHourlyPrice']);
Route::put('/prices/reservation/update', [ParkingPriceController::class, 'updateReservationPrice']);
Route::get('/prices/reservation', [ParkingPriceController::class, 'getReservationPrice']);

Route::put('/prices/hourly/update', [ParkingPriceController::class, 'updateHourlyPrice']);
Route::get('/prices/hourly', [ParkingPriceController::class, 'getHourlyPrice']);
Route::post('/price/agent/viewprice',[ParkingPriceController::class, 'AgentreservationAndHourlyPrice']);


// payments 
Route::post('/payment/reservation', [PaymentController::class, 'payForReservation']);
Route::post('/payment/check-in', [PaymentController::class, 'payForCheckIn']);
Route::post('/payments/report', [PaymentController::class, 'paymentReport']);
