<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_range_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_question_id')->constrained('survey_questions')->cascadeOnDelete();
            $table->integer('from');
            $table->integer('to');
            $table->unsignedInteger('step');
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_range_questions');
    }
};
