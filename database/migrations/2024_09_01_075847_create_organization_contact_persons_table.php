<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_contact_persons', function (Blueprint $table) {
            $table->id();

            $table->string('name', length: 128);
            $table->string('email', length: 64)->nullable();
            $table->string('phone', length: 64)->nullable();
            $table->string('postcode_city', length: 64)->nullable();
            $table->string('street_hnr', length: 128)->nullable();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_contact_persons');
    }
};
