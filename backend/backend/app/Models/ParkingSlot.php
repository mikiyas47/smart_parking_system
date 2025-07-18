<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class ParkingSlot extends Model
{
    use HasFactory;
    use HasApiTokens;

    protected $fillable = [
        'status',
        'agent_id',
        'city',
        'sub_city',
        'woreda',
        'location_name'
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'parking_slot_id');
    }
    
    public function slots(): HasMany
    {
        return $this->hasMany(Slot::class, 'parking_slot_id');
    }
} 