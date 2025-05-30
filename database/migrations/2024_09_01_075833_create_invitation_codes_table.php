<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invitation_codes', function (Blueprint $table) {
            $table->id();
            $table->char('code', length: 8)->unique();
            $table->foreignId('editor_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained('users')->noActionOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('invitation_codes');
    }
};
