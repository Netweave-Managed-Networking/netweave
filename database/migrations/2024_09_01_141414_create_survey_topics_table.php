<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_topics', function (Blueprint $table) {
            $table->id();
            $table->string('title', 128)->unique();
            $table->string('description', length: 512)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('tooltip', length: 1024)->nullable();
            $table->json('question_positions');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_topics');
    }
};
