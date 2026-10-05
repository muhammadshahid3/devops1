<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Slot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

/**
 * Everything a logged-in doctor can manage: profile (education etc.), slots, bookings.
 */
class DoctorPanelController extends Controller
{
    public function profile(Request $request)
    {
        return response()->json(['user' => $request->user()->load('doctorProfile')]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'specialization' => 'required|string|max:255',
            'education' => 'nullable|string|max:2000',
            'experience_years' => 'nullable|integer|min:0|max:70',
            'bio' => 'nullable|string|max:2000',
            'fee' => 'nullable|numeric|min:0',
            'clinic_address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $user->update(['name' => $data['name'], 'phone' => $data['phone'] ?? null]);

        $user->doctorProfile()->updateOrCreate(
            ['user_id' => $user->id],
            Arr::only($data, ['specialization', 'education', 'experience_years', 'bio', 'fee', 'clinic_address', 'city'])
        );

        return response()->json(['user' => $user->fresh('doctorProfile')]);
    }

    // ---------- Slots ----------

    public function slots(Request $request)
    {
        $slots = Slot::where('doctor_id', $request->user()->id)
            ->where('date', '>=', now()->toDateString())
            ->with('appointment.patient:id,name,phone')
            ->orderBy('date')->orderBy('start_time')
            ->get();

        return response()->json(['slots' => $slots]);
    }

    /**
     * Doctor picks a date + working hours + duration, we cut it into slots.
     * e.g. 10:00 -> 13:00 every 30 min = 6 slots.
     */
    public function storeSlots(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration' => 'required|integer|in:10,15,20,30,45,60',
        ]);

        $cursor = Carbon::createFromFormat('H:i', $data['start_time']);
        $end = Carbon::createFromFormat('H:i', $data['end_time']);
        $created = 0;

        while ($cursor->copy()->addMinutes($data['duration'])->lte($end)) {
            $slotEnd = $cursor->copy()->addMinutes($data['duration']);

            $slot = Slot::firstOrCreate(
                [
                    'doctor_id' => $request->user()->id,
                    'date' => $data['date'],
                    'start_time' => $cursor->format('H:i:s'),
                ],
                ['end_time' => $slotEnd->format('H:i:s'), 'is_booked' => false]
            );

            if ($slot->wasRecentlyCreated) {
                $created++;
            }

            $cursor = $slotEnd;
        }

        if ($created === 0) {
            return response()->json([
                'message' => 'No new slots were added. Those times already exist or the range is too short.',
            ], 422);
        }

        return response()->json(['message' => "{$created} slots added.", 'created' => $created], 201);
    }

    public function destroySlot(Request $request, $id)
    {
        $slot = Slot::where('doctor_id', $request->user()->id)->findOrFail($id);

        if ($slot->is_booked) {
            return response()->json([
                'message' => 'A patient has booked this slot. Cancel the appointment first.',
            ], 422);
        }

        $slot->delete();

        return response()->json(['message' => 'Slot removed.']);
    }

    // ---------- Appointments ----------

    public function appointments(Request $request)
    {
        $appointments = Appointment::where('doctor_id', $request->user()->id)
            ->with(['patient:id,name,email,phone', 'slot'])
            ->get()
            ->sortBy(fn ($a) => $a->slot->date.' '.$a->slot->start_time)
            ->values();

        return response()->json(['appointments' => $appointments]);
    }

    public function updateAppointment(Request $request, $id)
    {
        $data = $request->validate(['status' => 'required|in:completed,cancelled']);

        $appointment = Appointment::where('doctor_id', $request->user()->id)->findOrFail($id);

        if ($appointment->status !== 'booked') {
            return response()->json(['message' => 'This appointment is already closed.'], 422);
        }

        DB::transaction(function () use ($appointment, $data) {
            $appointment->update(['status' => $data['status']]);

            if ($data['status'] === 'cancelled') {
                $appointment->slot()->update(['is_booked' => false]); // free the slot again
            }
        });

        return response()->json([
            'appointment' => $appointment->fresh(['patient:id,name,email,phone', 'slot']),
        ]);
    }
}
