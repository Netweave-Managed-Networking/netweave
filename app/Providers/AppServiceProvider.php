<?php

namespace App\Providers;

use App\Models\RegistrationCode;
use App\Observers\RegistrationCodeObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RegistrationCode::observe(RegistrationCodeObserver::class);
    }
}
