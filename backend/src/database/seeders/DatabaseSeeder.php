<?php

namespace Database\Seeders;

use App\Models\DoctorProfile;
use App\Models\Slot;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo patient  ->  patient@demo.test / password
        User::firstOrCreate(
            ['email' => 'patient@demo.test'],
            ['name' => 'Ali Raza', 'password' => 'password', 'role' => 'patient', 'phone' => '0300-1234567']
        );

        $doctors = [
            [
                'email' => 'ayesha@doctor.test', 'name' => 'Dr. Ayesha Khan', 'phone' => '0301-1111111',
                'specialization' => 'Cardiologist', 'experience_years' => 12, 'fee' => 3000, 'city' => 'Lahore',
                'clinic_address' => 'Heart Care Clinic, Gulberg III, Lahore',
                'education' => "MBBS - King Edward Medical University\nFCPS Cardiology - College of Physicians & Surgeons Pakistan\nFellowship in Interventional Cardiology - AFIC Rawalpindi",
                'bio' => 'Treats heart rhythm problems, high blood pressure and chest pain. Focus on prevention and long-term follow up.',
            ],
            [
                'email' => 'bilal@doctor.test', 'name' => 'Dr. Bilal Ahmed', 'phone' => '0302-2222222',
                'specialization' => 'Dermatologist', 'experience_years' => 8, 'fee' => 2000, 'city' => 'Faisalabad',
                'clinic_address' => 'Skin & Hair Clinic, D Ground, Faisalabad',
                'education' => "MBBS - Nishtar Medical University\nFCPS Dermatology - College of Physicians & Surgeons Pakistan",
                'bio' => 'Acne, eczema, hair loss and allergy care for adults and teenagers.',
            ],
            [
                'email' => 'sana@doctor.test', 'name' => 'Dr. Sana Malik', 'phone' => '0303-3333333',
                'specialization' => 'Pediatrician', 'experience_years' => 10, 'fee' => 1800, 'city' => 'Faisalabad',
                'clinic_address' => 'Little Steps Children Clinic, Madina Town, Faisalabad',
                'education' => "MBBS - Allama Iqbal Medical College\nDCH - Diploma in Child Health\nFCPS Paediatrics - College of Physicians & Surgeons Pakistan",
                'bio' => 'Newborn care, vaccinations, growth checks and common childhood illness.',
            ],
            [
                'email' => 'hamza@doctor.test', 'name' => 'Dr. Hamza Raza', 'phone' => '0304-4444444',
                'specialization' => 'Dentist', 'experience_years' => 6, 'fee' => 1500, 'city' => 'Lahore',
                'clinic_address' => 'Smile Dental Studio, DHA Phase 5, Lahore',
                'education' => "BDS - de'Montmorency College of Dentistry\nRDS - Restorative Dentistry",
                'bio' => 'Fillings, root canals, braces consultation and teeth whitening.',
            ],
            [
                'email' => 'fatima@doctor.test', 'name' => 'Dr. Fatima Noor', 'phone' => '0305-5555555',
                'specialization' => 'Gynecologist', 'experience_years' => 15, 'fee' => 3500, 'city' => 'Islamabad',
                'clinic_address' => 'Mother & Child Hospital, F-8 Markaz, Islamabad',
                'education' => "MBBS - Aga Khan University\nFCPS Obstetrics & Gynaecology - College of Physicians & Surgeons Pakistan",
                'bio' => 'Pregnancy care, PCOS and women health check ups in a calm, private setting.',
            ],
            [
                'email' => 'usman@doctor.test', 'name' => 'Dr. Usman Tariq', 'phone' => '0306-6666666',
                'specialization' => 'Orthopedic Surgeon', 'experience_years' => 11, 'fee' => 2800, 'city' => 'Karachi',
                'clinic_address' => 'Bone & Joint Center, Clifton, Karachi',
                'education' => "MBBS - Dow University of Health Sciences\nFCPS Orthopaedic Surgery - College of Physicians & Surgeons Pakistan",
                'bio' => 'Sports injuries, joint pain, fractures and knee replacement advice.',
            ],
        ];

        foreach ($doctors as $d) {
            $user = User::firstOrCreate(
                ['email' => $d['email']],
                ['name' => $d['name'], 'password' => 'password', 'role' => 'doctor', 'phone' => $d['phone']]
            );

            DoctorProfile::firstOrCreate(['user_id' => $user->id], [
                'specialization' => $d['specialization'],
                'education' => $d['education'],
                'experience_years' => $d['experience_years'],
                'bio' => $d['bio'],
                'fee' => $d['fee'],
                'clinic_address' => $d['clinic_address'],
                'city' => $d['city'],
            ]);

            // Slots for the next 7 days: morning + evening session, 30 min each
            for ($i = 0; $i < 7; $i++) {
                $date = now()->addDays($i)->toDateString();
                foreach ([['10:00', '13:00'], ['17:00', '19:00']] as [$from, $to]) {
                    $this->makeSlots($user->id, $date, $from, $to, 30);
                }
            }
        }
    }

    private function makeSlots(int $doctorId, string $date, string $from, string $to, int $minutes): void
    {
        $cursor = Carbon::createFromFormat('H:i', $from);
        $end = Carbon::createFromFormat('H:i', $to);

        while ($cursor->copy()->addMinutes($minutes)->lte($end)) {
            $next = $cursor->copy()->addMinutes($minutes);

            Slot::firstOrCreate(
                ['doctor_id' => $doctorId, 'date' => $date, 'start_time' => $cursor->format('H:i:s')],
                ['end_time' => $next->format('H:i:s'), 'is_booked' => false]
            );

            $cursor = $next;
        }
    }
}
