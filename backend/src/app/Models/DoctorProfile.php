<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorProfile extends Model
{
    protected $fillable = [
        'user_id', 'specialization', 'education', 'experience_years',
        'bio', 'fee', 'clinic_address', 'city',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
