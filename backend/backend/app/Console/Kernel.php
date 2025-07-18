<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\AutoExpireReservations;
/*App\Console: The namespace where this class belongs.
ConsoleKernel: This is Laravel's internal class that handles CLI commands and scheduled task
Schedule: The class used to define how often your tasks (commands) should run.
AutoExpireReservations: This is your custom command to expire reservations.* */
class Kernel extends ConsoleKernel
{// means "Hey, I have a new custom command called AutoExpireReservations,
    // make it available to Artisan. so now we can run php artisan reservations:expire
    protected $commands = [
        AutoExpireReservations::class,
    ];
/*Here’s what this does:

Laravel has a built-in task scheduler (like a mini cron system).

You're telling Laravel:

"Run the reservations:expire command every minute."

This is very powerful — you can run tasks:

every minute: ->everyMinute()

daily: ->daily()

weekly: ->weekly()*/

//or even custom: ->cron('0 */3 * * *') (every 3 hours) 

    protected function schedule(Schedule $schedule)
    {
        // Runs every minute
        $schedule->command('reservations:expire')->everyMinute();
    }
/**This part:

Loads all Artisan command classes stored in app/Console/Commands/

Loads additional CLI routes from routes/console.php (usually not used often)

 */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
