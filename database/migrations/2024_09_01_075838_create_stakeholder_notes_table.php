<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_notes', function (Blueprint $table) {
            $table->id();
            $table->string('notes', 4096)->nullable()->fullText()->language('german');
            $table->string('criteria_for_coop', 4096)->nullable()->fullText()->language('german');
            $table->string('criteria_knockout_for_coop', 4096)->nullable()->fullText()->language('german');
            $table->foreignId('stakeholder_organization_id')->unique()->constrained('stakeholder_organizations')->cascadeOnDelete(); // unique because Note 1:1 Stakeholder
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_notes');
    }
};
