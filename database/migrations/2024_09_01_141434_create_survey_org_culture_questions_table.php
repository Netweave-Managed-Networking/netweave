<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_org_culture_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_question_id')->constrained('survey_questions')->cascadeOnDelete();
            $table->string('clan', length: 512);
            $table->string('adhocracy', length: 512);
            $table->string('market_orientated', length: 512);
            $table->string('hierarchy', length: 512);
            $table->unsignedInteger('budget_points');
            $table->string('dimension', 256)->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_org_culture_questions');
    }
};
