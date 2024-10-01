<?php

namespace App\Providers;

use App\Models\InvitationCode;
use App\Observers\InvitationCodeObserver;
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
        InvitationCode::observe(InvitationCodeObserver::class);
    }
}
