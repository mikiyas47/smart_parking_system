<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class CheckIn extends Model
{
    use HasFactory;
    use HasApiTokens;

    protected $fillable = [
        'car_id',
        'slot_id',
        'check_in_time',
        'check_out_time',
        'has_check_in',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime'
    ];
/**This sets up an inverse relationship from CheckIn to the Car model.

car_id in the check_ins table references the plate_number in the cars table.

This is not a typical numeric foreign key, which is why we specify:

'car_id' – the local column in check_ins

'plate_number' – the referenced column in cars

✅ Usage in code:
$checkIn = CheckIn::find(1);
$car = $checkIn->car; // Retrieves the associated Car by plate_number */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class, 'car_id', 'plate_number');
    }
/**This means the CheckIn model belongs to one parking slot.

It automatically assumes:

Foreign key: slot_id in check_ins

Local key: id in slots

✅ Usage in code:
$checkIn = CheckIn::find(1);
$slot = $checkIn->slot; // Gets the associated Slot model */
    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class, 'slot_id');
    }
} 