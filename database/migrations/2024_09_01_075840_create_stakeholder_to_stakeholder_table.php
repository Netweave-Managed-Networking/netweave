<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_to_stakeholder', function (Blueprint $table) {
            $table->foreignId('stakeholder_stating_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->foreignId('stakeholder_stated_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->string('type', length: 16)->comment("type: 'doesnt' | 'knows' | 'exchanges' | 'cooperates'");
            $table->boolean('conflict')->default(false);
            $table->primary(['stakeholder_stating_id', 'stakeholder_stated_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_to_stakeholder');
    }
};
