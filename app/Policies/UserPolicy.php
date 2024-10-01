<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine if the given user can be deleted by the admin.
     */
    public function delete(User $requestor, User $userToBeDeleted): Response
    {
        if ($requestor->role !== UserRole::ADMIN) {
            return Response::deny('Du bist nicht berechtigt, diesen Nutzer zu löschen.');
        }

        if ($requestor->id === $userToBeDeleted->id) {
            return Response::deny('Du bist nicht berechtigt, dein eigenes Profil über diese Route zu löschen.');
        }

        if ($userToBeDeleted->createdInvitationCodes()->exists()) {
            return Response::deny('Du bist nicht berechtigt, Nutzer zu löschen, die bereits andere Nutzer eingeladen haben.');
        }

        return Response::allow();

    }
}
