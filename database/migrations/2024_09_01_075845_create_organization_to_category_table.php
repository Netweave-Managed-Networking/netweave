<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_to_category', function (Blueprint $table) {
            $table->foreignId('organization_category_id')->constrained('organization_categories')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->primary(['organization_category_id', 'organization_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_to_category');
    }
};
