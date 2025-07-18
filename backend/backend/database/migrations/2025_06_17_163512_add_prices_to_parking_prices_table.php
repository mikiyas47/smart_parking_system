<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parking_prices', function (Blueprint $table) {
            $table->decimal('reservation_price', 8, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('parking_prices', function (Blueprint $table) {
            $table->dropColumn('reservation_price');
        });
    }
};
