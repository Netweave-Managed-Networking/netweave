<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_to_consent', function (Blueprint $table) {
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('consent_id')->constrained('consents')->cascadeOnDelete();
            $table->boolean('agreed')->default(false);
            $table->primary(['organization_id', 'consent_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_to_consent');
    }
};
