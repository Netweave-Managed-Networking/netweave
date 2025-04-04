<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contact_persons', function (Blueprint $table) {
            $table->id();

            $table->string('name', length: 127);
            $table->string('email', length: 63)->nullable();
            $table->string('phone', length: 63)->nullable();
            $table->string('postcode_city', length: 63)->nullable();
            $table->string('street_hnr', length: 127)->nullable();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->timestamps();
        });
        // nothing, not even email, is unique here in case the same contact person is contact for different organizations
    }

    public function down()
    {
        Schema::dropIfExists('contact_persons');
    }
};
