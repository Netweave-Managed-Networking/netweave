<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stakeholder_to_category', function (Blueprint $table) {
            $table->foreignId('stakeholder_category_id')->constrained('stakeholder_categories')->cascadeOnDelete();
            $table->foreignId('stakeholder_id')->constrained('stakeholder_organizations')->cascadeOnDelete();
            $table->primary(['stakeholder_category_id', 'stakeholder_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stakeholder_to_category');
    }
};
