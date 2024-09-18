<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_restrictions', function (Blueprint $table) {
            $table->id();
            $table->string('type', length: 16)->comment("type: regional' | 'thematic'");
            $table->string('description', 1024)->fullText();
            $table->foreignId('stakeholder_organization_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_restrictions');
    }
};
