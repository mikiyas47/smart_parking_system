<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Database\Factories\CarFactory;

class Car extends Model
{
    use HasFactory;
    protected $table = 'cars'; // Specify the table name if it's different from the model name
    protected $primaryKey = 'plate_number';

    // Disable auto-incrementing ID because plate_number is a string
    public $incrementing = false;

    // Set key type to string
    protected $keyType = 'string';

    // Define fillable fields for mass assignment
    protected $fillable = [
        'plate_number',
        'make',
        'model',
        'color'
    ];
// is used to create a new instance of the CarFactory
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
// is used to cast the created_at and updated_at attributes to datetime objects
// is used to define the fillable attributes of the Car model     
   

    /**
     * Get all check-ins for this car.
     * One car can have many check-in records in the check_ins table.
     * calles like
     *  $car = Car::find('ABC123');
     *  $checkIns = $car->checkIns;  Returns all check-ins for that car
     */
    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }
}
