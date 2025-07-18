<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    DB::statement("ALTER TABLE reservations MODIFY status ENUM('active', 'cancelled', 'expired', 'checked_in') DEFAULT 'active'");
}

public function down()
{
    DB::statement("ALTER TABLE reservations MODIFY status ENUM('active', 'cancelled', 'expired') DEFAULT 'active'");
}

};
