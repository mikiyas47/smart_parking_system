<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SlotController;

Route::get('/home', function () {
    return view('welcome');
});

// Authentication Routes for Web
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Session checker
Route::post('/check-session', [SlotController::class, 'checksession']);
