<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_to_consent', function (Blueprint $table) {
            $table->foreignId('stakeholder_organization_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->foreignId('consent_id')->constrained('consents')->cascadeOnDelete();
            $table->boolean('agreed')->default(false);
            $table->primary(['stakeholder_organization_id', 'consent_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_to_consent');
    }
};
