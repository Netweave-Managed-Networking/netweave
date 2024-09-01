<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_likert_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_question_id')->constrained('survey_questions')->onDelete('cascade');
            $table->boolean('is_inverted');
            $table->boolean('is_nep');
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_likert_questions');
    }
};
