<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_notes', function (Blueprint $table) {
            $table->id();
            $table->string('notes', 4096)->nullable()->fullText()->language('german');
            $table->string('criteria_for_coop', 4096)->nullable()->fullText()->language('german');
            $table->string('criteria_knockout_for_coop', 4096)->nullable()->fullText()->language('german');
            $table->foreignId('organization_id')->unique()->constrained('organizations')->cascadeOnDelete(); // unique because Note 1:1 Organization
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_notes');
    }
};
