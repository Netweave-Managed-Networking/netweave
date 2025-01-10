<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\InvitationCode;
use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\ResourceCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->usersAndInvitationCodes();
        $this->organizationsAndCategories();
        $this->resourcesAndCategories();
    }

    private function usersAndInvitationCodes(): void
    {
        User::factory()->create([
            'name' => 'Test Morv',
            'email' => 'marvinfrede@gmx.de',
            'role' => UserRole::ADMIN,
        ]);

        /** @var Collection<InvitationCode> */
        $codes = InvitationCode::factory(9)->create(); // Create 9 InvitationCodes + 9 Editors
        $codes->push(InvitationCode::factory()->state([
            'editor_id' => (bool) random_int(0, 1) ? User::factory() : null,
        ])->create());
    }

    private function organizationsAndCategories(): void
    {
        /** @var Collection<OrganizationCategory> */
        $organization_categories = OrganizationCategory::factory(20)->create();

        /** @var Collection<Organization> */
        $organizations = Organization::factory(12)->create()->each(function (Organization $organization) use ($organization_categories): void {
            $some_categories = $organization_categories->random(fake()->numberBetween(1, 3));
            $organization->organizationCategories()->saveMany($some_categories);
        });
    }

    private function resourcesAndCategories(): void
    {
        ResourceCategory::factory(40)->create();
        $this->callWith(ResourceSeeder::class, ['count' => 150]);
    }
}
