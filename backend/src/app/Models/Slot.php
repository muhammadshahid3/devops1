<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slot extends Model
{
    protected $fillable = ['doctor_id', 'date', 'start_time', 'end_time', 'is_booked'];

    protected $casts = ['is_booked' => 'boolean'];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // The live (not cancelled) appointment that holds this slot
    public function appointment()
    {
        return $this->hasOne(Appointment::class)->where('status', '!=', 'cancelled');
    }
}
