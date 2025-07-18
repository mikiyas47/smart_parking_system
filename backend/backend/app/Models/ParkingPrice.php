<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParkingPrice extends Model
{
    protected $fillable = [
        'parking_slot_id',
        'reservation_price',
        'price_per_hour',
    ];
    public function parkingSlot()
    {
        return $this->belongsTo(ParkingSlot::class);
    }
}
