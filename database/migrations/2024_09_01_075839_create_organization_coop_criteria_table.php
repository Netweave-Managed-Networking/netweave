<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_coop_criteria', function (Blueprint $table) {
            $table->id();
            $table->string('for_coop', 4095)->nullable()->fullText()->language('german');
            $table->string('ko_no_coop', 4095)->nullable()->fullText()->language('german');
            $table->foreignId('organization_id')->unique()->constrained('organizations')->cascadeOnDelete(); // unique because Note 1:1 Organization
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_coop_criteria');
    }
};
