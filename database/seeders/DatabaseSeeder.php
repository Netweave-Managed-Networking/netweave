<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /** @var User */ $morv = User::factory()->create([
            'name' => 'Test Morv',
            'email' => 'marvinfrede@gmx.de',
            'role' => UserRole::ADMIN
        ]);

        /** @var Array<RegistrationCode>*/ $codes = RegistrationCode::factory(10)->create(['admin_id' => $morv->id]);
    }
}
