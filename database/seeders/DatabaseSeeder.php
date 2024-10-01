<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\InvitationCode;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test Morv',
            'email' => 'marvinfrede@gmx.de',
            'role' => UserRole::ADMIN,
        ]);

        /** @var \Illuminate\Support\Collection<InvitationCode> */
        $codes = InvitationCode::factory(9)->create(); // Create 9 InvitationCodes with newly created editor
        $codes->push(InvitationCode::factory()->state([
            'editor_id' => random_int(0, 1) ? User::factory() : null,
        ])->create());

    }
}
