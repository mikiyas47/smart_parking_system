<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\HasApiTokens;

class CarController extends Controller
{
    use HasApiTokens;

    /**
     * Register a new car in the system.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate input using the regular request
        $validated = $request->validate([
            'plate_number' => 'required|string|max:20|unique:cars,plate_number',
            'make' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'color' => 'required|string|max:20',
        ]);

        // Create the new car entry
        $car = Car::create($validated);

        // Return a successful JSON response
        return response()->json([
            'message' => 'Car registered successfully',
            'car' => $car,
        ], 201);
    }

    /**
     * Search for a car by plate number.
     */
    public function search(Request $request): JsonResponse
    {
        // Validate the plate number
        $validated = $request->validate([
            'plate_number' => 'required|string|max:20',
        ]);

        // Search for the car in the database
        $car = Car::where('plate_number', $validated['plate_number'])->first();

        // Return either the car or an error message
        if ($car) {
            return response()->json($car);
        } else {
            return response()->json(['message' => 'Car not found'], 404);
        }
    }

    /**
     * Update car information based on plate number.
     */
    public function updateByPlate(Request $request): JsonResponse
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'plate_number' => 'required|string|max:20',
                'make' => 'sometimes|string|max:50',
                'model' => 'sometimes|string|max:50',
                'color' => 'sometimes|string|max:20',
            ]);

            // Extract the plate number for searching
            $plateNumber = $validated['plate_number'];
            unset($validated['plate_number']); // Remove plate number from update data

            // Find the car by plate number
            $car = Car::where('plate_number', $plateNumber)->first();

            // Return error if car not found
            if (!$car) {
                return response()->json(['message' => 'Car not found'], 404);
            }

            // Update the car with validated data
            $car->update($validated);

            // Return success response
            return response()->json([
                'message' => 'Car information updated successfully',
                'car' => $car
            ]);
        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'message' => 'Error updating car information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index()
{
    $cars = Car::all(); // Or any query you need
    return response()->json($cars);
}

}
