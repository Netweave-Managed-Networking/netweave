<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name', length: 128)->unique();
            $table->string('email', length: 64)->nullable()->unique();
            $table->string('phone', length: 64)->nullable()->unique();
            $table->string('postcode_city', length: 64)->nullable();
            $table->string('street_hnr', length: 128)->nullable();
            $table->foreignId('organization_parent_id')->nullable()->constrained('organizations')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organizations');
    }
};
