<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationCodeController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('RegistrationCodes/List');
    }
}
