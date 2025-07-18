<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Models\Slot;
use Carbon\Carbon;

class AutoExpireReservations extends Command
{/*This defines how you call the command in the terminal. "php artisan reservations:expire"
    ou can also include options/arguments like this:
protected $signature = 'report:daily {userId} {--send-email}';* */
    protected $signature = 'reservations:expire';
/*
  $description
This is a short explanation of what the command does. It's shown when you run:
 */
    protected $description = 'Automatically expire reservations older than 30 minutes';

    public function handle()
    {
        $expiredReservations = Reservation::where('status', 'active')
            ->where('expires_at', '<', Carbon::now())
            ->get();

        foreach ($expiredReservations as $reservation) {
            $reservation->status = 'expired';
            $reservation->save();

            // Set the slot status back to 'free'
            $slot = Slot::find($reservation->slot_id);
            if ($slot && $slot->status === 'reserved') {
                $slot->status = 'free';
                $slot->save();
            }
        }

        $this->info("Expired " . count($expiredReservations) . " reservations.");
    }
}
