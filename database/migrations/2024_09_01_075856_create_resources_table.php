<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('summary', length: 256)->nullable()->fullText();
            $table->string('description', length: 8192)->fullText();
            $table->string('type', length: 16)->comment("type: 'resource' | 'requirement'");
            $table->foreignId('stakeholder_organization_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resources');
    }
};
