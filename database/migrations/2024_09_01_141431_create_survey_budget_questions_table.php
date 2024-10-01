<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_budget_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_question_id')->constrained('survey_questions')->cascadeOnDelete();
            $table->json('choices');
            $table->unsignedInteger('budget_points');
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_budget_questions');
    }
};
