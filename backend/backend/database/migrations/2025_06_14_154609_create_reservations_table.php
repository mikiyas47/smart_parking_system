<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('reservations', function (Blueprint $table) {
        $table->id();
        $table->string('plate_number');
        $table->foreign('plate_number')->references('plate_number')->on('cars');
        $table->unsignedBigInteger('slot_id');
        $table->foreign('slot_id')->references('id')->on('slots');
        $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
        $table->timestamp('reserved_at')->useCurrent();
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('reservations');
}

};
