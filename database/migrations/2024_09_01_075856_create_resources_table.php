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
            $table->tinyText('summary')->nullable()->fullText(); // 255
            $table->string('description', length: 8191)->fullText();
            $table->string('type', length: 15)->comment("type: 'resource' | 'requirement'")->index();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resources');
    }
};
