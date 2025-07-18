<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->string('plate_number')->primary(); // Make 'plate_number' the primary key
            $table->string('make');
            $table->string('model');
            $table->string('color');
            $table->timestamps(); // Adds 'created_at' and 'updated_at'
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
}; 