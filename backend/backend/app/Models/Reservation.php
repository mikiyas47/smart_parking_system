<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    // Table name (optional if follows Laravel convention)
    protected $table = 'reservations';

    // Mass assignable fields
    protected $fillable = [
        'plate_number',
        'slot_id',
        'status',
        'reserved_at',
        'expires_at',
    ];

    // Casts for automatic type conversion
    protected $casts = [
        'reserved_at' => 'datetime',
        'expires_at' => 'datetime',
        'status' => 'string',  // enum stored as string, no special cast needed
    ];

    /*
     * When you get this attribute from the model, convert it to this type. And when you save it back, format it accordingly.”

Common uses of $casts:
Cast Type	Description	Example
integer	Cast attribute to integer	'age' => 'integer'
float	Cast attribute to float	'price' => 'float'
boolean	Cast attribute to boolean	'is_active' => 'boolean'
datetime	Cast attribute to a Carbon instance	'created_at' => 'datetime'
array	Cast JSON string to array	'options' => 'array'
json	Cast attribute as JSON	'settings' => 'json'
collection	Cast attribute to a Laravel collection	'tags' => 'collection'

Example:
php
Copy
Edit
class Reservation extends Model
{
    protected $casts = [
        'reserved_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_paid' => 'boolean',
        'metadata' => 'array',
    ];
}
When you do $reservation->reserved_at, you get a Carbon date object, not just a raw string.

When you do $reservation->is_paid, you get true or false (boolean).

When you do $reservation->metadata, you get a PHP array.


     */
    public function car()
    {
        return $this->belongsTo(Car::class, 'plate_number', 'plate_number');
    }

    /**
     * Define relationship to Slot (assuming you have a Slot model)
     */
    public function slot()
    {
        return $this->belongsTo(Slot::class);
    }
}
