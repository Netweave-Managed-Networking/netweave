<?php

namespace App\Observers;

use App\Models\InvitationCode;

class InvitationCodeObserver
{
    public function deleting(InvitationCode $invitationCode)
    {
        if (! is_null($invitationCode->editor_id)) {
            throw new \Exception('Deletion not allowed: InvitationCode belongs to an editor. When the editor is deleted his InvitationCode will be deleted as well.');
        }
    }
}
