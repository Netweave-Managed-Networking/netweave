<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->string('name', 127);
            $table->string('description', length: 511)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('topic_positions');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('surveys');
    }
};
