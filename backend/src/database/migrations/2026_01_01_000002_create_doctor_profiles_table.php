<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('specialization')->default('General Physician');
            $table->text('education')->nullable();          // one degree per line
            $table->unsignedSmallInteger('experience_years')->nullable();
            $table->text('bio')->nullable();
            $table->decimal('fee', 10, 0)->nullable();
            $table->string('clinic_address')->nullable();
            $table->string('city')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_profiles');
    }
};
