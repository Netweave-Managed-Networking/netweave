<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resource_to_category', function (Blueprint $table) {
            $table->foreignId('resource_category_id')->constrained('resource_categories')->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            $table->primary(['resource_category_id', 'resource_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resource_to_category');
    }
};
