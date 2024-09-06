<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('consents', function (Blueprint $table) {
            $table->id();
            $table->text('paragraph')->comment("will be stored as html");
            $table->timestamp('review_date')->nullable()->comment("date in future on which the consent text must be review");
            $table->timestamp('valid_until')->nullable()->comment("date in future on which the consent text will be invalidated automatically");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('consents');
    }
};
