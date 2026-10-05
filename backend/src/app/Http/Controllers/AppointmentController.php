<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Slot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Patient side: book, list and cancel appointments.
 */
class AppointmentController extends Controller
{
    private const WITH = ['doctor:id,name', 'doctor.doctorProfile', 'slot'];

    public function index(Request $request)
    {
        $appointments = Appointment::where('patient_id', $request->user()->id)
            ->with(self::WITH)
            ->get()
            ->sortBy(fn ($a) => $a->slot->date.' '.$a->slot->start_time)
            ->values();

        return response()->json(['appointments' => $appointments]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slot_id' => 'required|integer|exists:slots,id',
            'reason' => 'nullable|string|max:500',
        ]);

        // Row lock => two patients can never take the same slot
        $appointment = DB::transaction(function () use ($data, $request) {
            $slot = Slot::lockForUpdate()->findOrFail($data['slot_id']);

            if ($slot->is_booked) {
                abort(422, 'This slot was just booked by someone else. Please pick another time.');
            }

            if (Carbon::parse("{$slot->date} {$slot->start_time}")->isPast()) {
                abort(422, 'This slot has already passed. Please pick a later time.');
            }

            $appointment = Appointment::create([
                'patient_id' => $request->user()->id,
                'doctor_id' => $slot->doctor_id,
                'slot_id' => $slot->id,
                'reason' => $data['reason'] ?? null,
                'status' => 'booked',
            ]);

            $slot->update(['is_booked' => true]);

            return $appointment;
        });

        return response()->json(['appointment' => $appointment->load(self::WITH)], 201);
    }

    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::where('patient_id', $request->user()->id)->findOrFail($id);

        if ($appointment->status !== 'booked') {
            return response()->json(['message' => 'Only booked appointments can be cancelled.'], 422);
        }

        DB::transaction(function () use ($appointment) {
            $appointment->update(['status' => 'cancelled']);
            $appointment->slot()->update(['is_booked' => false]);
        });

        return response()->json(['appointment' => $appointment->fresh(self::WITH)]);
    }
}
