<?php

namespace App\Observers;

use App\Models\RegistrationCode;

class RegistrationCodeObserver
{
    public function deleting(RegistrationCode $registrationCode)
    {
        if (! is_null($registrationCode->editor_id)) {
            throw new \Exception('Deletion not allowed: RegistrationCode belongs to an editor. When the editor is deleted his RegistrationCode will be deleted as well.');
        }
    }
}
