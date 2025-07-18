<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // 1. Reference to the parking area, not individual slot
            $table->unsignedBigInteger('parking_slot_id');
            $table->foreign('parking_slot_id')->references('id')->on('parking_slots')->onDelete('cascade');

            // 2. Car making the payment
            $table->string('plate_number');
            $table->foreign('plate_number')->references('plate_number')->on('cars')->onDelete('cascade');

            // 3. Amount paid
            $table->decimal('amount', 8, 2);

            // 4. Reason for payment: check-in or reservation
            $table->enum('payment_reason', ['reservation', 'check_in']);

            // 5. Time of payment
            $table->timestamp('paid_at')->useCurrent();

            // 6. Laravel default timestamps (created_at, updated_at)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};



/*| Expression      | Context          | Purpose                          | Returns                      |
| --------------- | ---------------- | -------------------------------- | ---------------------------- |
| `now()`         | Laravel/PHP code | Shorthand for `Carbon::now()`    | `Carbon` instance            |
| `Carbon::now()` | Laravel/PHP code | Full Carbon call                 | `Carbon` instance            |
| `useCurrent()`  | Migration        | DB-level default for `timestamp` | Adds SQL `CURRENT_TIMESTAMP` |
* */