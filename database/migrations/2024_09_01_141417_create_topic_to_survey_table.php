<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('topic_to_survey', function (Blueprint $table) {
            $table->foreignId('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->foreignId('survey_topic_id')->constrained('survey_topics')->cascadeOnDelete();
            $table->primary(['survey_id', 'survey_topic_id']); // Composite primary key
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('topic_to_survey');
    }
};
