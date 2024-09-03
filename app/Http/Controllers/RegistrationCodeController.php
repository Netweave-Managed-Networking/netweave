<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $registrationCodes = RegistrationCode::with('admin:id,name,email')->with('editor:id,name,email')->get();
        return Inertia::render('RegistrationCodes/Overview', [
            'registrationCodes' => $registrationCodes,
        ]);
    }
}
