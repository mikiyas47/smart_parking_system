<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Slot extends Model
{
    use HasFactory;
    use HasApiTokens;

    protected $fillable = [
        'slot_number',
        'status',
        'parking_slot_id',
        'agent_id',
        'has_check_in'
    ];
    
    /**
     * Get the parking slot that owns this slot
     */
    public function parkingSlot()
    {
        return $this->belongsTo(ParkingSlot::class, 'parking_slot_id');
    }
}
