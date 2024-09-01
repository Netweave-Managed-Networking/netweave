<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_text_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_question_id')->constrained('survey_questions')->onDelete('cascade');
            $table->boolean('is_multiline');
            $table->string('placeholder', length: 1024);
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_text_questions');
    }
};
