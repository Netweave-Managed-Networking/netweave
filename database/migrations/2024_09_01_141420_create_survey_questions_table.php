<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->string('text', length: 1024);
            $table->string('type', length: 16)->default('text')->comment("type: 'text' | 'choice' | 'range' | 'likert' | 'budget' | 'org_culture'");
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('tooltip', length: 1024)->nullable();
            $table->foreignId('survey_topic_id')->constrained('survey_topics')->noActionOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('survey_questions');
    }
};
