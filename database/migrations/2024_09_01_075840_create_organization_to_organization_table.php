<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organization_to_organization', function (Blueprint $table) {
            $table->foreignId('organization_stating_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('organization_stated_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('type', length: 15)->comment("type: 'doesnt' | 'knows' | 'exchanges' | 'cooperates'");
            $table->boolean('conflict')->default(false);
            $table->primary(['organization_stating_id', 'organization_stated_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_to_organization');
    }
};
