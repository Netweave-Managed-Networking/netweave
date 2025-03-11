<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resource_categories', function (Blueprint $table) {
            $table->id();
            $table->string('title', 63)->unique();
            $table->string('definition', 1023)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resource_categories');
    }
};
