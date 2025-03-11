<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', length: 63)->unique();
            $table->tinyText('description')->nullable(); // 255
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_categories');
    }
};
