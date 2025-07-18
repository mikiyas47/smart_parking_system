<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'plate_number',
        'parking_slot_id',
        'amount',
        'payment_reason',
        'paid_at',
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parkingSlot()
    {
        return $this->belongsTo(ParkingSlot::class);
    }
}
