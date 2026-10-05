<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorPanelController;
use Illuminate\Support\Facades\Route;

// ---------- Public ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show'])->whereNumber('id');
Route::get('/specializations', [DoctorController::class, 'specializations']);

// ---------- Logged in ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Doctor only
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {
        Route::get('/profile', [DoctorPanelController::class, 'profile']);
        Route::put('/profile', [DoctorPanelController::class, 'updateProfile']);

        Route::get('/slots', [DoctorPanelController::class, 'slots']);
        Route::post('/slots', [DoctorPanelController::class, 'storeSlots']);
        Route::delete('/slots/{id}', [DoctorPanelController::class, 'destroySlot']);

        Route::get('/appointments', [DoctorPanelController::class, 'appointments']);
        Route::patch('/appointments/{id}', [DoctorPanelController::class, 'updateAppointment']);
    });

    // Patient only
    Route::middleware('role:patient')->group(function () {
        Route::get('/patient/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    });
});
