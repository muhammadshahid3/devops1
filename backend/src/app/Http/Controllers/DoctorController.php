<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Public doctor directory (what patients browse before booking).
 */
class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();

        $query = User::query()
            ->where('role', 'doctor')
            ->whereHas('doctorProfile')
            ->with('doctorProfile')
            ->withCount(['slots as available_slots_count' => function ($q) use ($today) {
                $q->where('is_booked', false)->where('date', '>=', $today);
            }]);

        if ($search = trim((string) $request->query('q', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('doctorProfile', function ($p) use ($search) {
                        $p->where('specialization', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%");
                    });
            });
        }

        if ($spec = $request->query('specialization')) {
            $query->whereHas('doctorProfile', fn ($p) => $p->where('specialization', $spec));
        }

        $doctors = $query->orderBy('name')->get()->each->makeHidden(['email', 'phone']);

        return response()->json(['doctors' => $doctors]);
    }

    public function show($id)
    {
        $doctor = User::where('role', 'doctor')->with('doctorProfile')->findOrFail($id);
        $doctor->makeHidden(['email', 'phone']);

        $now = now();

        // Upcoming slots only (booked ones are returned too so the UI can cross them out)
        $slots = Slot::where('doctor_id', $doctor->id)
            ->where(function ($q) use ($now) {
                $q->where('date', '>', $now->toDateString())
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('date', $now->toDateString())
                            ->where('start_time', '>', $now->format('H:i:s'));
                    });
            })
            ->orderBy('date')->orderBy('start_time')
            ->get(['id', 'date', 'start_time', 'end_time', 'is_booked']);

        return response()->json(['doctor' => $doctor, 'slots' => $slots]);
    }

    public function specializations()
    {
        return response()->json([
            'specializations' => DoctorProfile::query()
                ->distinct()->orderBy('specialization')->pluck('specialization'),
        ]);
    }
}
