<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', length: 64)->unique();
            $table->string('description', length: 256)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_categories');
    }
};
