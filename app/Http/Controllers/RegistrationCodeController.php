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
        $registrationCodes = RegistrationCode::all();
        return Inertia::render('RegistrationCodes/List', [
            'registrationCodes' => $registrationCodes,
        ]);
    }
}
