<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the given user can be deleted by the admin.
     */
    public function delete(User $requestor, User $userToBeDeleted): bool
    {
        if ($requestor->role !== UserRole::ADMIN) {
            return false;
        }

        if ($requestor->id === $userToBeDeleted->id) {
            return false;
        }

        if ($userToBeDeleted->createdRegistrationCodes()->exists()) {
            return false;
        }

        return true;
    }
}
